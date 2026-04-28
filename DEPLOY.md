# Deploying to Google Cloud Run

Two services: a FastAPI backend (`tradingagents-api`) and a Next.js frontend (`tradingagents-web`). The script builds both with Cloud Build and deploys them to Cloud Run.

## One-time setup

1. Create or select a GCP project and enable billing.
2. Install the Google Cloud SDK locally **or** open <https://shell.cloud.google.com>.
3. Authenticate and pick the project:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
4. Enable the APIs the deploy needs:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     cloudbuild.googleapis.com \
     artifactregistry.googleapis.com
   ```

## Deploy

From the repo root:

```bash
PROJECT_ID=your-project REGION=us-central1 bash scripts/deploy-gcp.sh
```

The script:

1. Builds the API image from `Dockerfile.api`, pushes to GCR.
2. Deploys `tradingagents-api` to Cloud Run with `CORS_ORIGINS=*` (temporary).
3. Reads back the API URL.
4. Builds the web image with `NEXT_PUBLIC_API_BASE` baked in (via `frontend/cloudbuild.yaml`), pushes to GCR.
5. Deploys `tradingagents-web` to Cloud Run.
6. Tightens API CORS to allow only the deployed web URL.
7. Prints both URLs.

Total runtime ~6–8 min on a clean project.

## Provider keys

The agents need at least one LLM provider key. After the script finishes:

```bash
gcloud run services update tradingagents-api \
  --region us-central1 \
  --update-env-vars OPENAI_API_KEY=sk-...,ANTHROPIC_API_KEY=sk-ant-...
```

For a broker-enabled demo also set `ALPACA_API_KEY` and `ALPACA_SECRET_KEY`.

## Demo caveats

- **Auth is disabled.** Anyone with the web URL can hit the dashboard. Do not put real money behind it. To re-enable auth, restore `frontend/src/proxy.ts` from git, fix `frontend/src/app/layout.tsx`, and configure the OAuth/email providers.
- **State is ephemeral.** Cloud Run instances are recycled. The runner writes decision history to local disk; that resets when the instance scales to zero. Fine for a live demo, not for a multi-day pilot. For persistence, swap to GCS or Firestore.
- **Cold start is ~3–5s.** Hit both URLs once before your demo to warm them.

## Useful follow-up commands

Tail logs:
```bash
gcloud run services logs read tradingagents-api --region us-central1 --limit 50
gcloud run services logs read tradingagents-web --region us-central1 --limit 50
```

Redeploy just one service after a code change:
```bash
# API only
gcloud builds submit --tag gcr.io/$PROJECT_ID/tradingagents-api --file Dockerfile.api .
gcloud run deploy tradingagents-api --image gcr.io/$PROJECT_ID/tradingagents-api --region us-central1

# Web only (needs the current API URL)
API_URL=$(gcloud run services describe tradingagents-api --region us-central1 --format 'value(status.url)')
gcloud builds submit --config frontend/cloudbuild.yaml \
  --substitutions=_API_BASE=$API_URL,_IMAGE=gcr.io/$PROJECT_ID/tradingagents-web \
  frontend
gcloud run deploy tradingagents-web --image gcr.io/$PROJECT_ID/tradingagents-web --region us-central1
```

Tear it all down:
```bash
gcloud run services delete tradingagents-api tradingagents-web --region us-central1
```
