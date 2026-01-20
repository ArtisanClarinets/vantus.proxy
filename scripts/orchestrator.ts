import { spawn, ChildProcess } from 'child_process';
import net from 'net';
import path from 'path';

// --- Configuration ---
const DEFAULT_PORT = 3000;

// --- Helpers ---

/**
 * Checks if a port is available.
 */
const isPortAvailable = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        server.listen(port);
    });
};

/**
 * Finds the next available port starting from the given port.
 */
const getNextPort = async (startPort: number, usedPorts: Set<number>): Promise<number> => {
    let port = startPort;
    while (!(await isPortAvailable(port)) || usedPorts.has(port)) {
        port++;
    }
    return port;
};

/**
 * Parses command line arguments to find --port
 */
const parseArgs = () => {
    const args = process.argv.slice(2);
    const portIndex = args.indexOf('--port');
    if (portIndex !== -1 && args[portIndex + 1]) {
        return parseInt(args[portIndex + 1], 10);
    }
    return DEFAULT_PORT;
};

// --- Main Orchestrator ---

async function main() {
    console.log('🚀 Starting Vantus Proxy Orchestrator...');

    const basePort = parseArgs();
    if (isNaN(basePort)) {
        console.error('❌ Invalid port number specified.');
        process.exit(1);
    }

    const usedPorts = new Set<number>();

    // 1. Allocate Control Plane Port
    const controlPlanePort = await getNextPort(basePort, usedPorts);
    usedPorts.add(controlPlanePort);
    console.log(`📌 Allocated Control Plane Port: ${controlPlanePort}`);

    // 2. Allocate Config Renderer Port
    const configRendererPort = await getNextPort(basePort + 1, usedPorts);
    usedPorts.add(configRendererPort);
    console.log(`📌 Allocated Config Renderer Port: ${configRendererPort}`);

    // 3. Define Services
    const processes: ChildProcess[] = [];
    const rootDir = path.resolve(__dirname, '..');

    // --- Service: Config Renderer ---
    console.log('⚙️  Starting Config Renderer...');
    const configRenderer = spawn('npm', ['run', 'start'], {
        cwd: path.join(rootDir, 'services/config-renderer'),
        env: {
            ...process.env,
            PORT: configRendererPort.toString(),
        },
        stdio: 'inherit', // Pipe output to main console
        shell: true
    });
    processes.push(configRenderer);

    // --- Service: Control Plane ---
    // Wait a bit for renderer? Not strictly necessary if retry logic exists, but good practice.
    console.log('⚙️  Starting Control Plane...');
    const controlPlane = spawn('npm', ['run', 'start'], {
        cwd: path.join(rootDir, 'apps/control-plane'),
        env: {
            ...process.env,
            PORT: controlPlanePort.toString(),
            CONFIG_RENDERER_URL: `http://localhost:${configRendererPort}`,
        },
        stdio: 'inherit',
        shell: true
    });
    processes.push(controlPlane);

    console.log(`\n✅ System started successfully!`);
    console.log(`👉 Control Plane: http://localhost:${controlPlanePort}`);
    console.log(`👉 Config Renderer: http://localhost:${configRendererPort}\n`);

    // --- Cleanup ---
    const cleanup = () => {
        console.log('\n🛑 Shutting down services...');
        processes.forEach(p => p.kill());
        process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

main().catch(err => {
    console.error('❌ Orchestrator failed:', err);
    process.exit(1);
});
