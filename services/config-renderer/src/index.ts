import Fastify from 'fastify';
import cors from '@fastify/cors';
import nunjucks from 'nunjucks';
import { prisma } from 'database';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = util.promisify(exec);
const fastify = Fastify({ logger: true });

const TEMPLATE_DIR = process.env.TEMPLATE_DIR || '/app/templates';
const NGINX_CONF_DIR = process.env.NGINX_CONF_DIR || '/etc/nginx/conf.d';

const env = nunjucks.configure(TEMPLATE_DIR, {
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true
});

fastify.register(cors);

async function reloadNginx() {
    try {
        await execAsync('nginx -s reload');
        fastify.log.info('Nginx reloaded successfully');
        return true;
    } catch (e) {
        fastify.log.error(e);
        return false;
    }
}

fastify.post('/render', async (request, reply) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                domains: true,
                upstreamPools: true,
                edgePolicies: true
            }
        });

        const renderedFiles: { filename: string, content: string }[] = [];

        for (const tenant of tenants) {
            for (const domain of tenant.domains) {
                const pool = tenant.upstreamPools[0];
                const policy = tenant.edgePolicies[0] || {};

                if (!pool) continue;

                // Nunjucks render
                // Ensure template exists
                const config = env.render('tenant.server.conf.njk', {
                    domain: domain.name,
                    upstreamName: `upstream_${tenant.slug}_${pool.name}`,
                    upstreamTargets: pool.targets,
                    tenantId: tenant.id,
                    edgePolicy: policy
                });

                renderedFiles.push({
                    filename: `${tenant.slug}_${domain.name}.conf`,
                    content: config
                });
            }
        }

        const hash = crypto.createHash('sha256').update(JSON.stringify(renderedFiles)).digest('hex');
        return { status: 'ok', hash, files: renderedFiles };
    } catch (e) {
        fastify.log.error(e);
        reply.code(500);
        return { status: 'error', message: String(e) };
    }
});

fastify.post('/deploy', async (request, reply) => {
    const { files, hash } = request.body as any;

    if (!files || !Array.isArray(files)) {
        reply.code(400);
        return { status: 'error', message: 'Invalid files' };
    }

    const backupDir = `/tmp/nginx_backup_${Date.now()}`;
    await fs.mkdir(backupDir, { recursive: true });

    try {
        // Backup
        try {
            const currentFiles = await fs.readdir(NGINX_CONF_DIR);
            for (const f of currentFiles) {
                if (f.endsWith('.conf')) {
                    await fs.copyFile(path.join(NGINX_CONF_DIR, f), path.join(backupDir, f));
                }
            }
        } catch (e) {
            // Ignore if conf dir empty/not exists
        }

        // Clean
        try {
            const currentFiles = await fs.readdir(NGINX_CONF_DIR);
            for (const f of currentFiles) {
                if (f.endsWith('.conf')) {
                    await fs.unlink(path.join(NGINX_CONF_DIR, f));
                }
            }
        } catch (e) {}

        // Write
        for (const file of files) {
            await fs.writeFile(path.join(NGINX_CONF_DIR, file.filename), file.content);
        }

        // Validate
        await execAsync('nginx -t');

        // Reload
        await reloadNginx();

        // Record Deployment in DB (global history)
        await prisma.deploymentHistory.create({
            data: {
                hash: hash || 'manual',
                status: 'SUCCESS',
                logs: 'Deployed ' + files.length + ' files'
            }
        });

        return { status: 'deployed', hash };

    } catch (e) {
        fastify.log.error('Deployment failed, rolling back', e);

        // Rollback
        try {
             const currentFiles = await fs.readdir(NGINX_CONF_DIR);
             for (const f of currentFiles) await fs.unlink(path.join(NGINX_CONF_DIR, f));

             const backupFiles = await fs.readdir(backupDir);
             for (const f of backupFiles) {
                 await fs.copyFile(path.join(backupDir, f), path.join(NGINX_CONF_DIR, f));
             }

             await reloadNginx();
        } catch (rollbackError) {
            fastify.log.error('Rollback failed', rollbackError);
        }

        await prisma.deploymentHistory.create({
            data: {
                hash: hash || 'manual',
                status: 'FAILED',
                logs: String(e)
            }
        });

        reply.code(400);
        return { status: 'failed', error: String(e) };
    }
});

fastify.get('/health', async () => {
    return { status: 'ok' };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
