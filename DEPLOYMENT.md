# Deployment Guide

This document outlines how to deploy the Document OCR Parser frontend to Google Cloud Run and other platforms.

## Google Cloud Run Deployment (Recommended)

The application is optimized for deployment on Google Cloud Run as a containerized service.

### Prerequisites

1. **Google Cloud Project** - An active Google Cloud project.
2. **Google Cloud CLI** - Installed and configured on your local machine.
3. **Docker** - For building the container image.

### 1. Configure allowedHosts

Vite includes a security feature that blocks requests from unknown hosts. You must add your Cloud Run URL to `vite.config.ts`:

```typescript
// vite.config.ts
export default defineConfig({
  // ...
  server: {
    allowedHosts: [
      'your-service-name-hash.europe-west1.run.app'
    ],
  },
});
```

### 2. Build and Push to Artifact Registry

```bash
# Set your project ID
PROJECT_ID="your-project-id"
REGION="europe-west1"
SERVICE_NAME="insurance-ocr-ui"

# Create Artifact Registry repository if it doesn't exist
gcloud artifacts repositories create $SERVICE_NAME \
    --repository-format=docker \
    --location=$REGION

# Build the image using Cloud Build
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME .
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy $SERVICE_NAME \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="GEMINI_API_KEY=your_key,OCR_API_KEY=your_key"
```

**Note:** The container uses the `PORT` environment variable (default 8080 on Cloud Run) to listen for requests.

---

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

---

## GitHub Actions CI

The project includes a CI workflow (`.github/workflows/ci.yml`) that automatically:
1. Installs dependencies
2. Runs linting checks
3. Builds the application
4. Verifies the build output

Deployment to GitHub Pages has been disabled in favor of Google Cloud Run.

---

## Environment Variables

Configure these variables for deployment:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | API key for Gemini AI OCR service |
| `OCR_API_KEY` | No | Alternative OCR service API key |
| `VITE_APP_URL` | No | Application base URL |
| `PORT` | No | Port for the server to listen on (default 3000) |

---

## Troubleshooting

### Blocked Request (Allowed Hosts)

If you see an error like `Blocked request. This host (...) is not allowed`, add the hostname to the `allowedHosts` array in `vite.config.ts`.

### Container Failed to Start

Ensure that the server is listening on the port defined by the `PORT` environment variable. The code uses `process.env.PORT || 3000`.

### API Key Issues

- Never commit secrets to the repository.
- Use Cloud Run environment variables or Secret Manager to handle sensitive data.
