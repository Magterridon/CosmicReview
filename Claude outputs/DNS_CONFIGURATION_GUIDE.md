# DNS Configuration - cosmicreview.fr on Vercel

## Overview
This guide shows how to point your OVH-registered `cosmicreview.fr` domain to Vercel.

## Step 1: Add Domain to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings → Domains**
3. Enter: `cosmicreview.fr`
4. Click **Add**

Vercel will show you two DNS configuration options:
- **Nameserver change** (easier, recommended)
- **DNS records** (if you want to keep OVH for other services)

## Option A: Change Nameservers (Recommended)

### In Vercel Dashboard:
1. After adding the domain, you'll see Vercel's nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
   (exact names may vary)

2. Copy these nameserver addresses

### In OVH Control Panel:

1. Go to https://www.ovh.com/manager/
2. Login with your account
3. Go to **Domains → cosmicreview.fr**
4. Click **DNS Management** or **Nameservers**
5. Edit the nameservers:
   - Replace existing ones with Vercel's nameservers
   - Save changes

6. **Wait 24-48 hours** for DNS to propagate (but usually works within hours)

### Verify in Vercel:
- The domain status will change from "Pending" to "Active"
- You'll see a checkmark next to `cosmicreview.fr`

## Option B: DNS Records (if using OVH for email or other services)

### In Vercel Dashboard:
1. Click your domain `cosmicreview.fr`
2. Copy the DNS records provided (usually an A record and CNAME record)
3. Example values:
   - **A Record**: @ → 76.76.21.21 (or similar Vercel IP)
   - **CNAME Record**: www → cname.vercel-dns.com

### In OVH Control Panel:
1. Go to **Domains → cosmicreview.fr → DNS Zone**
2. Add the records from Vercel:
   - Delete or update existing A records pointing to OVH
   - Add Vercel's A record for apex (cosmicreview.fr)
   - Add CNAME for www subdomain
3. Save

**Note:** This method requires more manual management but lets you keep some services with OVH.

## Step 2: Set Primary Domain in Vercel

1. In Vercel Settings → Domains
2. Make `cosmicreview.fr` the **primary domain** (no www prefix)
3. Set `www.cosmicreview.fr` as an alias to redirect to main domain

## Step 3: Verify Everything Works

### Check DNS Resolution:
```bash
# In terminal/PowerShell
nslookup cosmicreview.fr
dig cosmicreview.fr
```

Should resolve to Vercel's IP address (76.76.x.x or similar)

### Test the Website:
- Visit https://cosmicreview.fr/
- Visit https://www.cosmicreview.fr/
- Visit https://cosmicreview.fr/equipe
- Visit https://cosmicreview.fr/le-projet

All should load the same site.

### Check HTTPS:
- Site should have HTTPS (green lock icon)
- No warnings about certificate

## Timing

- **Nameserver changes**: 24-48 hours to fully propagate (but may work sooner)
- **DNS records**: 15 minutes to a few hours
- **Check status**: https://www.whatsmydns.net/#A/cosmicreview.fr

## Troubleshooting

### Domain still shows OVH page
- **Nameserver changes not propagated yet** - wait a few more hours
- **DNS cache** - try in private/incognito mode or clear cache
- **Wrong nameservers entered** - double-check OVH panel

### Site shows "Domain not configured" on Vercel
- Make sure domain is added in Vercel
- DNS records/nameservers may not have propagated yet
- Check Vercel dashboard - domain should be "Active"

### HTTPS not working initially
- Vercel needs valid DNS pointing before HTTPS works
- May take 30-60 minutes after DNS is correct
- Wait and refresh

## Support

- **Vercel Help**: https://vercel.com/docs/concepts/projects/custom-domains
- **OVH Help**: https://www.ovh.com/manager/ (Domains section)
- **DNS Checker**: https://www.whatsmydns.net
