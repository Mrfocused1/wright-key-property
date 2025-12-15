# Deployment Guide - Clean URLs Configuration

Your site is currently returning 404 errors because the clean URLs (without .html extensions) require server-side configuration. I've created configuration files for the most common hosting platforms.

## Current Issue

- **Local Development**: Works fine with `bs-config.json` using browser-sync
- **Production**: Returns 404 because the server doesn't know to serve `.html` files for clean URLs

## Solutions by Hosting Platform

### Option 1: Apache (.htaccess)

**File**: `.htaccess` (already created)

This file handles:
- Clean URL rewrites (e.g., `/coliving` → `/coliving.html`)
- Removes `.html` from existing URLs with 301 redirects
- Forces HTTPS
- Removes www prefix

**How to deploy**:
1. Upload `.htaccess` to your site's root directory
2. Ensure Apache has `mod_rewrite` enabled
3. Restart Apache if needed

### Option 2: Netlify

**File**: `netlify.toml` (already created)

**How to deploy**:
1. Commit `netlify.toml` to your repository
2. Deploy via:
   - **GitHub**: Connect repo to Netlify, auto-deploys on push
   - **Drag & Drop**: Drag entire folder to Netlify drop zone
   - **CLI**: `npm install -g netlify-cli && netlify deploy --prod`

### Option 3: Vercel

**File**: `vercel.json` (already created)

**How to deploy**:
1. Commit `vercel.json` to your repository
2. Deploy via:
   - **GitHub**: Connect repo to Vercel, auto-deploys on push
   - **CLI**: `npm install -g vercel && vercel --prod`

### Option 4: Nginx

**File**: `nginx.conf` (already created)

**How to deploy**:
1. SSH into your server
2. Edit Nginx config: `sudo nano /etc/nginx/sites-available/wrightkeyroperty`
3. Paste the contents from `nginx.conf`
4. Update SSL certificate paths
5. Test config: `sudo nginx -t`
6. Reload Nginx: `sudo systemctl reload nginx`

### Option 5: GitHub Pages

**Note**: GitHub Pages doesn't support server-side rewrites. You have two options:

#### A. Use .html extensions (revert changes)
```bash
# Revert all hrefs back to using .html
# Example: href="/coliving" → href="/coliving.html"
```

#### B. Use a workaround with 404.html
Create a `404.html` that redirects to the correct page:
```html
<!DOCTYPE html>
<html>
<head>
    <script>
        const path = window.location.pathname.slice(1);
        const pages = ['coliving', 'search', 'investor', 'property'];
        if (pages.includes(path)) {
            window.location.replace('/' + path + '.html');
        }
    </script>
</head>
<body>
    <p>Redirecting...</p>
</body>
</html>
```

## Which Hosting Platform Are You Using?

To fix your 404 errors, I need to know which platform hosts `wrightkeyroperty.site`:

1. **Check your hosting dashboard** to identify the platform
2. **Common platforms**:
   - Netlify (netlify.com)
   - Vercel (vercel.com)
   - GitHub Pages (github.io)
   - Digital Ocean / AWS / Self-hosted (likely uses Apache or Nginx)
   - Hostinger / Bluehost / GoDaddy (likely uses Apache with .htaccess)

## Quick Fix: Testing

To test if the configuration works:

### For Apache/.htaccess:
```bash
# Upload .htaccess to your root directory via FTP/SFTP
# Visit https://wrightkeyroperty.site/coliving
```

### For Netlify/Vercel:
```bash
# Commit and push the config files
git add .htaccess netlify.toml vercel.json nginx.conf DEPLOYMENT_GUIDE.md
git commit -m "Add server configuration for clean URLs"
git push

# Then redeploy on your platform
```

## Verification

Once deployed, test these URLs:
- ✅ `https://wrightkeyroperty.site/coliving` (should work)
- ✅ `https://wrightkeyroperty.site/search` (should work)
- ✅ `https://wrightkeyroperty.site/investor` (should work)
- ✅ `https://wrightkeyroperty.site/property?id=kensington` (should work)
- ✅ `https://wrightkeyroperty.site/coliving.html` (should redirect to /coliving)

## Troubleshooting

### Still getting 404 errors?

1. **Check if the config file is in the right location**:
   - `.htaccess`: Root directory (same level as index.html)
   - `netlify.toml`: Root directory
   - `vercel.json`: Root directory
   - `nginx.conf`: Server config directory (varies by setup)

2. **Check server logs** for clues about why rewrites aren't working

3. **Verify mod_rewrite is enabled** (Apache):
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

4. **Clear browser cache** or test in incognito mode

5. **Check file permissions**:
   ```bash
   chmod 644 .htaccess
   ```

## Need Help?

Let me know:
1. Which hosting platform you're using
2. Whether you have SSH access to the server
3. Any error messages from your hosting dashboard or server logs

I'll provide specific instructions for your setup.
