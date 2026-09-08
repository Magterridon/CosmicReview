# GitHub Setup Guide - Cosmic Review

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `cosmic-review` (or your preferred name)
3. Description: "Web site for Cosmic Review film project"
4. Select: **Public** (recommended for portfolio, or Private if preferred)
5. Click **Create repository**

## Step 2: Initialize Git on Your Local Machine

Open a terminal in `D:\Workspace\CosmicReview` and run:

```bash
# Initialize git repo
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Cosmic Review Astro website

- Multi-page Astro project with interactive UI
- Pages: Homepage, Team (Équipe), Project (Projet), Partners (Partenaires)
- Features: GSAP animations, SVG star map navigation, responsive design
- Static site optimized for Vercel deployment"

# Add the remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/cosmic-review.git

# Rename main branch if needed (GitHub uses 'main' by default)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify on GitHub

1. Go to https://github.com/USERNAME/cosmic-review
2. Confirm all files are visible:
   - `src/` folder with all pages and components
   - `public/` folder with images and favicons
   - `package.json`, `astro.config.mjs`, `tsconfig.json`
   - Other config files

## Notes

- Replace `USERNAME` with your actual GitHub username
- If you have 2FA enabled, use a Personal Access Token instead of your password
- The repo is now ready for Vercel deployment
