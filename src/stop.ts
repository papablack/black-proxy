import { spawn, ChildProcess } from 'child_process';
import path from 'path';
const cwd = path.join(__dirname, '..');

// Use Node.js to run PM2 script directly (works better on Windows)
const pm2Script = path.join(cwd, 'node_modules', 'pm2', 'bin', 'pm2');
// Use local PM2 to stop the process
const pm2Process: ChildProcess = spawn('node', [pm2Script, 'stop', 'black-proxy'], {
    stdio: ['ignore', 'pipe', 'pipe']
});

// Stream output to console
pm2Process.stdout?.on('data', (data: Buffer) => console.log(data.toString()));
pm2Process.stderr?.on('data', (data: Buffer) => console.error(`ERROR: ${data.toString()}`));

// Handle unexpected errors
pm2Process.on('error', (err: Error) => console.error(`Process Error: ${err.message}`));
