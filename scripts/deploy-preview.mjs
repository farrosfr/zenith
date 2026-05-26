import { execSync } from 'node:child_process';

let branch;
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
} catch {
  console.error('Error: not a git repository');
  process.exit(1);
}

const hasChanges = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
if (hasChanges) {
  execSync('git add -A', { stdio: 'inherit' });
  execSync('git commit -m "chore: deploy preview [skip ci]"', { stdio: 'inherit' });
}

console.log(`Pushing "${branch}" to trigger Cloudflare Pages preview...`);
execSync(`git push origin ${branch}`, { stdio: 'inherit' });
console.log('Deploy triggered. Check Cloudflare dashboard.');
