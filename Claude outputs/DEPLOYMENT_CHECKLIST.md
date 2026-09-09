# Cosmic Review Deployment Checklist

## Phase 1: GitHub Setup ✓ (Ready)

**Status**: Project files staged and verified
- [x] All source files ready (`src/` folder complete)
- [x] Configuration files present (package.json, astro.config.mjs)
- [x] Public assets ready (images, favicons)
- [x] Project structure verified: 4 pages (accueil, équipe, projet, partenaires)

**Next Action**: Initialize git and push to GitHub
```bash
cd D:\Workspace\CosmicReview
git init
git add .
git commit -m "Initial commit: Cosmic Review website"
git remote add origin https://github.com/YOUR_USERNAME/cosmic-review.git
git push -u origin main
```

## Phase 2: Vercel Deployment ✓ (Next)

**Status**: Ready to deploy after GitHub is set up

**Steps**:
1. [ ] Create GitHub repository (see GITHUB_SETUP_GUIDE.md)
2. [ ] Go to https://vercel.com
3. [ ] Import the `cosmic-review` GitHub repository
4. [ ] Verify Astro is auto-detected as framework
5. [ ] Click Deploy
6. [ ] Wait for build to complete
7. [ ] Test preview URL: https://cosmic-review-xxxxx.vercel.app
8. [ ] Verify all pages load:
   - [ ] Homepage (/)
   - [ ] Team (/equipe)
   - [ ] Project (/le-projet)
   - [ ] Partners (/partenaires)

**Expected**: Static site builds without errors, all pages load correctly

## Phase 3: Custom Domain Setup ✓ (Final)

**Status**: Ready to configure once Vercel deployment is live

**Steps**:
1. [ ] In Vercel dashboard: Settings → Domains
2. [ ] Add domain: `cosmicreview.fr`
3. [ ] Choose DNS method (see DNS_CONFIGURATION_GUIDE.md):
   - [ ] **Option A (Recommended)**: Update nameservers in OVH to Vercel's
   - [ ] **Option B**: Add DNS records in OVH console
4. [ ] Set `cosmicreview.fr` as primary domain
5. [ ] Set `www.cosmicreview.fr` as alias
6. [ ] Wait for DNS propagation (24-48 hours for nameservers, 15min-1hour for records)
7. [ ] Verify domain is "Active" in Vercel
8. [ ] Test HTTPS works (green lock icon)

## Phase 4: Final Verification ✓

**Before marking as complete**:
- [ ] Visit https://cosmicreview.fr (should load homepage)
- [ ] Visit https://cosmicreview.fr/equipe (team page)
- [ ] Visit https://cosmicreview.fr/le-projet (project page)
- [ ] Visit https://cosmicreview.fr/partenaires (partners page)
- [ ] Check HTTPS is working (green lock)
- [ ] Test on mobile (responsive design)
- [ ] Check all images and assets load correctly
- [ ] Verify navigation works (star map, page links)
- [ ] Test with no cache (incognito/private mode)

**Expected Result**: Professional, responsive Cosmic Review website live at cosmicreview.fr with all content and interactivity working correctly.

## Project Summary

**Domain**: cosmicreview.fr  
**Host**: Vercel (free tier)  
**Site Type**: Static Astro site  
**Pages**: 4 (accueil, équipe, projet, partenaires)  
**Tech Stack**: Astro, GSAP, SVG, Vanilla JS  
**Build Time**: ~1-2 minutes  
**Deployment**: Automatic (on GitHub push)

## Guides Available

1. **GITHUB_SETUP_GUIDE.md** - Initialize git and push to GitHub
2. **VERCEL_DEPLOYMENT_GUIDE.md** - Deploy from GitHub to Vercel
3. **DNS_CONFIGURATION_GUIDE.md** - Point cosmicreview.fr to Vercel
4. **DEPLOYMENT_CHECKLIST.md** - This file

## Support & Next Steps

After deployment is live:
- Every push to GitHub's `main` branch auto-deploys to Vercel
- Update content in `src/data/team.json` and `src/data/projet.json`
- Modify styles in `src/styles/` for design changes
- Add new pages by creating `.astro` files in `src/pages/`

**Status**: ✓ Ready to deploy - follow guides in order!
