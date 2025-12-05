# GitHub Secrets Setup Guide

## Required Secrets

For the CI/CD pipeline to work correctly, you need to set the following secrets in your GitHub repository:

### Required Secrets

1. **VITE_API_URL** - Main API Gateway URL
   - Example: `https://wanyumba.com/api/v1`

2. **VITE_WANYUMBA_FRONTEND_URL** - Frontend application URL
   - Example: `https://wanyumba.com`

3. **VITE_SCRAPER_API_URL** - Scraper API URL
   - Example: `http://188.253.25.153:8002/api/v1`

### Optional Secrets

These are optional and only needed if you're using these features:

- **VITE_ENABLE_OAUTH** - Enable OAuth authentication
- **VITE_RECAPTCHA_SITE_KEY** - reCAPTCHA site key

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** (top menu)
3. In the left sidebar, click on **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with its name and value
6. Click **Add secret**

## Important Notes

- **Secrets are case-sensitive** - Use exact names as listed above
- **Secrets are encrypted** - They cannot be viewed after creation (only updated/deleted)
- **Secrets are available to workflows** - But NOT to fork PRs for security reasons
- **Secrets are needed for builds** - Without them, the build will use default/local values

## Troubleshooting

If the workflow fails with "Missing required secret" errors:

1. Verify the secret name matches exactly (case-sensitive)
2. Check that the secret is set at the repository level (not organization level unless configured)
3. For PRs: Secrets are only available if the PR is from the same repository (not forks)
4. After adding secrets, you may need to re-run the workflow

## Current Values

Make sure your secrets match these expected values:

```
VITE_API_URL=https://wanyumba.com/api/v1
VITE_WANYUMBA_FRONTEND_URL=https://wanyumba.com
VITE_SCRAPER_API_URL=http://188.253.25.153:8002/api/v1
```

