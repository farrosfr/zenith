import { execSync } from 'node:child_process';

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const PROJECT = 'zenix-test';

if (!CF_API_TOKEN) {
  console.error('Error: CF_API_TOKEN environment variable is not set');
  process.exit(1);
}

if (!CF_ACCOUNT_ID) {
  console.error('Error: CF_ACCOUNT_ID environment variable is not set');
  process.exit(1);
}

let branch;
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
} catch {
  console.error('Error: not a git repository or failed to get branch name');
  process.exit(1);
}

console.log(`Deploying branch "${branch}" to Cloudflare Pages...`);

try {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${PROJECT}/deploy`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ branch }),
    }
  );

  const data = await response.json();

  if (data.success) {
    console.log(`Deploy triggered successfully!`);
    console.log(`Deployment ID: ${data.result?.id}`);
    console.log(`URL: ${data.result?.url || 'check Cloudflare dashboard'}`);
  } else {
    console.error('Deploy failed:', JSON.stringify(data.errors, null, 2));
    process.exit(1);
  }
} catch (err) {
  console.error('Error triggering deploy:', err.message);
  process.exit(1);
}
