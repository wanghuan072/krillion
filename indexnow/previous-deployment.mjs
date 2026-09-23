const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const currentDeploymentId = Number(process.env.CURRENT_DEPLOYMENT_ID || 0);
const environment = process.env.DEPLOYMENT_ENVIRONMENT || "Production";

if (!repository || !token || !currentDeploymentId) {
  process.stdout.write("HEAD^");
  process.exit(0);
}

const headers = {
  accept: "application/vnd.github+json",
  authorization: `Bearer ${token}`,
  "x-github-api-version": "2022-11-28",
  "user-agent": "krillion-indexnow-workflow",
};

async function githubJson(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status} for ${path}`);
  return response.json();
}

try {
  const deployments = await githubJson(`/repos/${repository}/deployments?environment=${encodeURIComponent(environment)}&per_page=100`);
  for (const deployment of deployments) {
    if (deployment.id === currentDeploymentId || !deployment.sha) continue;
    const statuses = await githubJson(`/repos/${repository}/deployments/${deployment.id}/statuses?per_page=100`);
    if (statuses.some((status) => status.state === "success")) {
      process.stdout.write(deployment.sha);
      process.exit(0);
    }
  }
} catch (error) {
  console.error(`Could not resolve the previous production deployment: ${error.message}`);
}

process.stdout.write("HEAD^");

