import { spawn } from 'node:child_process';
const child = spawn('npx', ['tsx', 'watch', './app/api/index.ts'], {
  stdio: 'inherit',
  shell: true
});