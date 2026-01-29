import { execSync, spawn } from 'child_process';
import net from 'net';

/**
 * Helper to execute command and print output
 */
function run(command: string, options: { ignoreError?: boolean, stdio?: 'inherit' | 'pipe' | 'ignore' } = {}) {
    try {
        execSync(command, { stdio: options.stdio || 'inherit' });
        return true;
    } catch (e) {
        if (!options.ignoreError) {
            console.error(`❌ Command failed: ${command}`);
            process.exit(1);
        }
        return false;
    }
}

/**
 * Check if Docker is running
 */
function checkDocker() {
    console.log('🐳 Checking Docker status...');
    if (!run('docker info', { stdio: 'ignore', ignoreError: true })) {
        console.error('❌ Docker is not running or not accessible. Please start Docker and try again.');
        process.exit(1);
    }
    console.log('✅ Docker is running.');
}

/**
 * Wait for a port to be open
 */
async function waitForPort(port: number, host: string = 'localhost', timeoutMs: number = 60000): Promise<void> {
    const startTime = Date.now();
    process.stdout.write(`⏳ Waiting for ${host}:${port} `);

    return new Promise((resolve, reject) => {
        const tryConnect = () => {
            if (Date.now() - startTime > timeoutMs) {
                process.stdout.write('\n');
                reject(new Error(`Timeout waiting for ${host}:${port}`));
                return;
            }

            const socket = new net.Socket();
            socket.setTimeout(2000);

            socket.on('connect', () => {
                socket.destroy();
                process.stdout.write(' ✅ Connected!\n');
                resolve();
            });

            socket.on('timeout', () => {
                socket.destroy();
                process.stdout.write('.');
                setTimeout(tryConnect, 1000);
            });

            socket.on('error', (err) => {
                socket.destroy();
                process.stdout.write('.');
                setTimeout(tryConnect, 1000);
            });

            socket.connect(port, host);
        };
        tryConnect();
    });
}

async function main() {
    console.log('\n🚀 Starting Vantus Proxy Development Environment Setup\n');

    // 1. Check Docker
    checkDocker();

    // 2. Start Infrastructure
    console.log('\n🏗️  Starting Database and Redis via Docker Compose...');
    // Try 'docker compose' (v2) first, then fallback to 'docker-compose' (v1) if needed,
    // but here we just switch to 'docker compose' as it's the modern standard.
    run('docker compose up -d mariadb redis');

    // 3. Wait for DB
    try {
        await waitForPort(3306, 'localhost');
    } catch (e) {
        console.error('\n❌ Failed to connect to database. Is it running?');
        console.error('Try running "docker compose logs mariadb" to debug.');
        process.exit(1);
    }

    // 4. Seed Database
    console.log('\n🌱 Seeding Database...');
    // We force the environment to ensure connection works
    try {
        run('npm run seed --workspace=database', { stdio: 'inherit' });
    } catch (e) {
        console.error('❌ Seeding failed.');
        process.exit(1);
    }

    console.log('\n🎉 Setup Complete!');
    console.log('=======================================================');
    console.log('You can now run the application:');
    console.log('   👉 npm run dev');
    console.log('\nOr run the full dev stack (setup + run):');
    console.log('   👉 npm run dev:all');
    console.log('=======================================================\n');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
