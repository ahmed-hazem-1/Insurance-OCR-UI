# Deployment Guide

This document outlines how to deploy the Document OCR Parser frontend to GitHub Pages and other platforms.

## GitHub Pages Deployment

### Automatic Deployment with GitHub Actions

The project includes GitHub Actions workflows that automatically build and deploy your application.

#### Prerequisites

1. **GitHub Repository** - Push this code to a GitHub repository
2. **Environment Secrets** - Configure the following secrets in your GitHub repository settings:
   - `GEMINI_API_KEY` - Your Gemini API key
   - `OCR_API_KEY` - Your OCR service API key (optional)
   - `VITE_APP_URL` - Your application URL

#### Setting Up Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - Name: `GEMINI_API_KEY`, Value: your API key
   - Name: `OCR_API_KEY`, Value: your OCR API key
   - Name: `VITE_APP_URL`, Value: `https://yourusername.github.io/Insurance-api/frontend/`

#### Deploy on Push

Push to the `main` branch to trigger automatic deployment:

```bash
git push origin main
```

The workflow will:
1. Install dependencies
2. Run linting checks
3. Build the application
4. Deploy to GitHub Pages

Your app will be available at: `https://yourusername.github.io/Insurance-api/frontend/`

#### Manual Deployment

Trigger a manual deployment via GitHub Actions:

1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

### Configuring GitHub Pages

1. Go to **Settings** → **Pages**
2. Set **Source** to "Deploy from a branch"
3. Select **gh-pages** branch (created automatically by deploy workflow)
4. Click **Save**

## Manual Local Build & Deploy

### Build Locally

```bash
npm install
npm run build
```

This creates a `dist/` directory with optimized production build.

### Deploy to GitHub Pages Manually

1. Build the project (see above)
2. Create a `gh-pages` branch:
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push -u origin gh-pages
   ```

3. Update GitHub repository settings to use `gh-pages` branch for Pages deployment

## Docker Deployment

### Build Docker Image

```bash
docker build -t insurance-ocr-frontend .
```

### Run Docker Container

```bash
docker run -p 8080:3000 \
  -e GEMINI_API_KEY="your-api-key" \
  -e OCR_API_KEY="your-ocr-key" \
  -e APP_URL="http://localhost:8080" \
  insurance-ocr-frontend
```

## Environment Variables

Configure these variables for deployment:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | API key for Gemini AI OCR service |
| `OCR_API_KEY` | No | Alternative OCR service API key |
| `VITE_APP_URL` | No | Application base URL (for redirects) |

### .env.local (Development)

```env
GEMINI_API_KEY=your_api_key_here
OCR_API_KEY=your_ocr_key_here
VITE_APP_URL=http://localhost:5173
```

### .env.production (Production)

```env
GEMINI_API_KEY=your_production_api_key
OCR_API_KEY=your_production_ocr_key
VITE_APP_URL=https://yourdomain.com/Insurance-api/frontend/
```

## Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] GitHub repository secrets configured
- [ ] GitHub Pages enabled in repository settings
- [ ] Actions workflows enabled
- [ ] First deployment triggered successfully
- [ ] Verify app works at deployment URL
- [ ] API keys are secure and not exposed in code
- [ ] `.env.local` is in `.gitignore` (already configured)

## CI/CD Workflows

### 1. CI Workflow (`ci.yml`)

- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Node versions**: 18.x, 20.x
- **Steps**:
  - Install dependencies
  - Run linting (TypeScript strict mode)
  - Build application
  - Upload artifacts

### 2. Deploy Workflow (`deploy-pages.yml`)

- **Triggers**: Push to `main`, Manual trigger
- **Prerequisites**: Successful CI build
- **Steps**:
  - Build application
  - Upload to GitHub Pages artifact
  - Deploy to GitHub Pages

## Troubleshooting

### Build Fails

- Ensure all dependencies are installed: `npm ci`
- Check TypeScript for errors: `npm run lint`
- Verify Node.js version is 18.x or higher

### Secrets Not Found

- Verify secrets are configured in repository Settings
- Check secret names match workflow file exactly
- Ensure branch pushing to matches workflow trigger

### GitHub Pages Not Updating

- Check Actions tab for workflow status
- Verify `gh-pages` branch exists
- Check GitHub Pages settings point to `gh-pages` branch
- Clear browser cache

### API Key Issues

- Never commit `.env.local` to repository
- Always use GitHub Secrets for sensitive data
- Rotate API keys if exposed

## Performance Monitoring

After deployment, monitor:

- Page load performance using Chrome DevTools
- API response times and errors
- Service worker and caching behavior
- Browser console for JavaScript errors

## Rollback

To revert to a previous deployment:

1. Go to **Actions** tab
2. Find previous successful deployment run
3. Download the build artifact
4. Manually deploy the artifact to GitHub Pages

Or reset the gh-pages branch:

```bash
git checkout gh-pages
git reset --hard origin/main~N  # where N is number of commits to go back
git push -f origin gh-pages
```

## Support

For issues with:

- **GitHub Actions**: See workflow runs in Actions tab
- **Deployment**: Check GitHub Pages settings
- **Application**: See console errors in browser DevTools
