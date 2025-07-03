import { spawn } from 'node:child_process';
const child = spawn('npx', ['tsx', 'watch', 'backend/api/index.ts'], {
  stdio: 'inherit',
  shell: true
});