# Hostinger Deployment Guide - Fix 404 Errors

## Quick Fix Instructions

Your site is hosted on Hostinger, which uses Apache. The `.htaccess` file will fix your 404 errors.

### Method 1: File Manager (Recommended - Easiest)

1. **Log into Hostinger hPanel**
   - Go to https://hpanel.hostinger.com
   - Sign in with your credentials

2. **Open File Manager**
   - Click on "Files" → "File Manager" in the left sidebar
   - Or click on your domain, then "File Manager"

3. **Navigate to public_html**
   - Open the `public_html` folder (or `domains/wrightkeyroperty.site/public_html`)
   - This is where your index.html file is located

4. **Upload .htaccess**
   - Click "Upload Files" button (top right)
   - Select the `.htaccess` file from your computer
   - **Location**: `/Users/paulbridges/wright key property/.htaccess`
   - Wait for upload to complete

5. **Verify the file**
   - Click the eye icon (👁️) to enable "Show Hidden Files" at the top
   - You should see `.htaccess` in the file list
   - Right-click → Edit to verify contents if needed

6. **Test immediately**
   - Open https://wrightkeyroperty.site/coliving in a new incognito window
   - Should load without 404 error

### Method 2: FTP (Alternative)

1. **Get FTP credentials from Hostinger**
   - Go to hPanel → Files → FTP Accounts
   - Note: Hostname, Username, Password, Port (usually 21)

2. **Connect using FTP client**
   - Download FileZilla (free): https://filezilla-project.org
   - Connect using your credentials
   - Navigate to `public_html` folder

3. **Upload .htaccess**
   - Drag `.htaccess` from local to remote `public_html` folder
   - Ensure "Show hidden files" is enabled in FileZilla (Server → Force showing hidden files)

4. **Set permissions** (if needed)
   - Right-click `.htaccess` → File permissions
   - Set to `644` (rw-r--r--)

### Method 3: Git Auto-Deploy (Advanced - For Future Updates)

1. **Enable Git deployment in Hostinger**
   - hPanel → Advanced → Git
   - Click "Create Repository"

2. **Connect to GitHub**
   - Repository URL: `https://github.com/Mrfocused1/wright-key-property.git`
   - Branch: `main`
   - Deployment path: `/domains/wrightkeyroperty.site/public_html`

3. **Deploy**
   - Click "Pull" to deploy latest version
   - Future updates will auto-deploy on push (if auto-deploy enabled)

## Verification Checklist

After uploading `.htaccess`, verify these URLs work:

- [ ] `https://wrightkeyroperty.site` (homepage)
- [ ] `https://wrightkeyroperty.site/coliving` (should load, not 404)
- [ ] `https://wrightkeyroperty.site/search` (should load)
- [ ] `https://wrightkeyroperty.site/investor` (should load)
- [ ] `https://wrightkeyroperty.site/property?id=kensington` (should load)
- [ ] `https://wrightkeyroperty.site/coliving.html` (should redirect to /coliving)

## Troubleshooting

### .htaccess file not showing up?
- Make sure "Show Hidden Files" is enabled in File Manager
- Files starting with `.` are hidden by default
- Check the toggle at the top of File Manager

### Still getting 404 errors?

**1. Check if .htaccess is in the correct location**
```
public_html/
├── .htaccess          ← Must be here
├── index.html
├── coliving.html
├── search.html
└── ...
```

**2. Check .htaccess permissions**
- Should be `644` (rw-r--r--)
- Right-click file → Permissions → Set to 644

**3. Check if mod_rewrite is enabled**
- Hostinger enables this by default
- Contact Hostinger support if needed: https://www.hostinger.com/contact

**4. Clear browser cache**
- Use incognito/private mode to test
- Or clear cache: Cmd+Shift+Delete (Mac) / Ctrl+Shift+Delete (Windows)

**5. Check error logs**
- hPanel → Advanced → Error Logs
- Look for .htaccess related errors

### .htaccess causing 500 Internal Server Error?

This is rare, but if it happens:

**Option A: Fix the .htaccess syntax**
1. Edit the file in File Manager
2. Try this simplified version:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+)$ $1.html [L,QSA]
```

**Option B: Contact Hostinger support**
- They can check server logs and help diagnose the issue

## Current File Location

The `.htaccess` file is at:
```
/Users/paulbridges/wright key property/.htaccess
```

You can open this folder in Finder:
1. Open Finder
2. Press Cmd+Shift+G
3. Paste: `/Users/paulbridges/wright key property/`
4. You'll see `.htaccess` file (might be greyed out as it's hidden)

## Expected Results

Once deployed:

✅ **Clean URLs work**: `/coliving`, `/search`, `/investor`, `/property`
✅ **.html URLs redirect**: `/coliving.html` → `/coliving` (301 redirect)
✅ **Homepage works**: `/` loads index.html
✅ **HTTPS enforced**: http:// redirects to https://
✅ **www removed**: www.wrightkeyroperty.site → wrightkeyroperty.site

## Need More Help?

If you encounter any issues:
1. Take a screenshot of the error
2. Check error logs in hPanel
3. Let me know the specific error message

The fix should be working within 1-2 minutes after uploading the `.htaccess` file.
