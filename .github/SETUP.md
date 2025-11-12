# GitHub Actions Setup

This repository includes a GitHub Actions workflow that automatically builds and pushes the Docker image to Docker Hub on every push to `main` or `master` branch.

## Required Secrets

To enable the auto-build workflow, you need to add these secrets to your GitHub repository:

### 1. DOCKER_HUB_USERNAME

Your Docker Hub username (e.g., `onatatmaca`)

### 2. DOCKER_HUB_TOKEN

A Docker Hub access token (NOT your password - use a token for security)

## How to Set Up Secrets

### Step 1: Create a Docker Hub Access Token

1. Go to [Docker Hub](https://hub.docker.com/)
2. Click on your profile → **Account Settings**
3. Go to **Security** → **Access Tokens**
4. Click **New Access Token**
5. Give it a name: `github-actions-morsemeplease`
6. Permissions: **Read & Write** (or **Read, Write, Delete**)
7. Click **Generate**
8. **Copy the token** (you won't see it again!)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/onatatmaca/morse-me-please`
2. Click **Settings** (top-right)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add two secrets:

**Secret 1:**
- Name: `DOCKER_HUB_USERNAME`
- Value: `onatatmaca` (your Docker Hub username)

**Secret 2:**
- Name: `DOCKER_HUB_TOKEN`
- Value: (paste the access token you copied from Docker Hub)

## How It Works

Once secrets are set up, the workflow will:

1. ✅ Trigger automatically on every push to `main` or `master`
2. ✅ Build the Docker image using your Dockerfile
3. ✅ Push two tags to Docker Hub:
   - `onatatmaca/morsemeplease:latest` (for production)
   - `onatatmaca/morsemeplease:<git-sha>` (for version tracking)
4. ✅ Use build cache to speed up subsequent builds

## Manual Trigger

You can also manually trigger the workflow:

1. Go to **Actions** tab in GitHub
2. Select **Build and Push Docker Image**
3. Click **Run workflow** → **Run workflow**

## After Push

Once the workflow completes:

1. Check the **Actions** tab to see the build logs
2. If successful, the new image is on Docker Hub
3. In TrueNAS SCALE, update your app:
   - **Apps → Installed → morsemeplease → ⋮ → Edit → Save**
   - TrueNAS will pull the new `latest` tag and redeploy

## Benefits

- 🚀 No need to build locally anymore
- ✅ Consistent builds in CI environment
- 🔄 Automatic on every push to main
- 📦 Version tracking with git SHA tags
- ⚡ Fast builds with caching

## Troubleshooting

### Workflow fails with "unauthorized" error
- Check that `DOCKER_HUB_TOKEN` is a valid access token (not password)
- Ensure the token has **Read & Write** permissions

### Image not updating in TrueNAS
- Make sure your Custom App has **Pull policy: Always**
- Click **Edit → Save** to force a pull and redeploy

### Want to test locally first?
- Disable auto-push: change `push: true` to `push: false` in the workflow
- Or only trigger on tags instead of main branch
