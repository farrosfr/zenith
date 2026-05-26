import 'dotenv/config';
import { execSync } from 'node:child_process';

const { CF_API_TOKEN, CF_ACCOUNT_ID } = process.env;

if (!CF_API_TOKEN) {
  console.error('Error: CF_API_TOKEN not set in .env or environment');
  process.exit(1);
}
if (!CF_ACCOUNT_ID) {
  console.error('Error: CF_ACCOUNT_ID not set in .env or environment');
  process.exit(1);
}

let branch;
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
} catch {
  console.error('Error: not a git repository');
  process.exit(1);
}

console.log(`Deploying "${branch}" to zenix-test...`);

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/zenix-test/deployments`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ branch }),
  }
);

const data = await res.json();

if (!data.success) {
  console.error('Deploy failed:', JSON.stringify(data.errors ?? data, null, 2));
  process.exit(1);
}

console.log(`Deploy triggered: ${data.result?.id}`);
console.log(`URL: ${data.result?.url ?? '(see Cloudflare dashboard)'}`);
