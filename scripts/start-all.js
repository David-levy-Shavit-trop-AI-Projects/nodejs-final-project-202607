'use strict';

// Convenience script for local development: starts all four microservices
// as child processes and forwards their output, prefixed with the service
// name. Each service still binds its own port (see .env), so this is purely
// a local convenience - it is not how the four processes are deployed.

const { spawn } = require('node:child_process');
const path = require('node:path');

const SERVICES = ['logs-service', 'users-service', 'costs-service', 'about-service'];

const children = SERVICES.map((name) => {
  const cwd = path.resolve(__dirname, '..', 'services', name);
  const child = spawn(process.execPath, ['server.js'], { cwd, stdio: 'pipe' });

  const prefix = `[${name}]`;
  child.stdout.on('data', (chunk) => process.stdout.write(`${prefix} ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`${prefix} ${chunk}`));
  child.on('exit', (code) => {
    console.log(`${prefix} exited with code ${code}`);
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
