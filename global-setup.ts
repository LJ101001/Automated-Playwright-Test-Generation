/// <reference types="node" />
import fs from 'fs';
import path from 'path';

function removeDir(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.error(`[setup] Cleared: ${dirPath}`);
  }
}

export default async function globalSetup(): Promise<void> {
  const root = path.resolve(__dirname);
  removeDir(path.join(root, 'test-results'));
  removeDir(path.join(root, 'playwright-report'));
}
