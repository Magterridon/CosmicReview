# Vercel Deployment Guide - Cosmic Review

## Overview
Once your GitHub repository is ready, Vercel can automatically build and deploy your Astro site with every push.

## Step 1: Connect Vercel to GitHub

1. Go to https://vercel.com
2. Sign up or log in with GitHub
3. Click **"Add New..." → "Project"**
4. Click **"Import Git Repository"**
5. Select your GitHub account and find `cosmic-review` repo
6. Click **Import**

## Step 2: Configure Astro Project Settings

Vercel should auto-detect Astro. Verify:
- **Framework Preset**: Astro ✓
- **Build Command**: `astro build` (default)
- **Output Directory**: `dist` (default)
- **Install Command**: `npm install` (default)

**Root Directory**: Make sure this is correct. If your `package.json` is at the root of your repo, leave blank. If it's in a subfolder like `src/`, set this to `src`.

## Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 1-2 minutes)
3. You'll get a preview URL like: `cosmic-review-xxxxx.vercel.app`
4. Click the link to verify your site loads correctly

## Step 4: Test All Pages

Visit these URLs to confirm all pages work:
- https://cosmic-review-xxxxx.vercel.app/ (Homepage)
- https://cosmic-review-xxxxx.vercel.app/equipe (Team)
- https://cosmic-review-xxxxx.vercel.app/le-projet (Project)
- https://cosmic-review-xxxxx.vercel.app/partenaires (Partners)

## Step 5: Connect Custom Domain (Next Task)

Once verified, you'll add your `cosmicreview.fr` domain in the **Settings** tab.

## Troubleshooting

### Build fails with "cannot find module"
- Ensure all imports in your files are correct
- Check that all files are committed to GitHub
- Verify the root directory setting matches your repo structure

### Pages return 404
- Check that page files match Astro routing: `src/pages/equipe.astro` → `/equipe`
- Verify page files are in `src/pages/` directory
- Check that astro.config.mjs has correct settings

### Images not loading
- Ensure public assets are in `public/` folder
- Check that references use correct paths
- Verify no environment-specific path issues

## Notes
- Vercel provides free HTTPS automatically
- Each push to `main` triggers automatic deployment
- Preview deployments available for pull requests
- See "Deployments" tab for build history
