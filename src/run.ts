import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Define log file path
const logFile = path.join(__dirname, '../logs/proxy.log');

if (!fs.existsSync(path.join(__dirname, '_routingTable.ts'))) {
    throw new Error('Create _routingTable.ts');
}

// Ensure log file exists or create it
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '', { flag: 'w' });
}

// Function to log output
const logOutput = (data: string): void => {
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${data}\n`);
};

const cwd = path.join(__dirname, '..');

// Use Node.js to run PM2 script directly (works better on Windows)
const pm2Script = path.join(cwd, 'node_modules', 'pm2', 'bin', 'pm2');

// Spawn PM2 process with inherited stdio (streams output to CLI)
const pm2Process: ChildProcess = spawn('node', [pm2Script, 'start', './run/proxy.js', '--name', 'black-proxy', '--restart-delay', '5000'], {
    stdio: 'inherit',
    cwd
});

// Start log tailing **immediately**, not based on process closing
console.log('\n[PM2] Streaming logs...\n');
const pm2Logs: ChildProcess = spawn('node', [pm2Script, 'logs', 'black-proxy', '--lines', '50'], {
    stdio: 'inherit' // Streams logs directly to CLI
});

pm2Logs.on('error', (err: Error) => {
    console.error(`Error streaming logs: ${err.message}`);
});
