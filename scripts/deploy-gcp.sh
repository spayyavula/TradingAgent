#!/usr/bin/env bash
# Deploy TradingAgents to Google Cloud Run.
#
# Prereqs (one-time):
#   gcloud auth login
#   gcloud config set project YOUR_PROJECT_ID
#   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
#
# Usage:
#   PROJECT_ID=my-project REGION=us-central1 bash scripts/deploy-gcp.sh

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${REGION:-us-central1}"
API_SERVICE="${API_SERVICE:-tradingagents-api}"
WEB_SERVICE="${WEB_SERVICE:-tradingagents-web}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "PROJECT_ID is not set. Run: gcloud config set project YOUR_PROJECT_ID" >&2
  exit 1
fi

API_IMAGE="gcr.io/${PROJECT_ID}/${API_SERVICE}"
WEB_IMAGE="gcr.io/${PROJECT_ID}/${WEB_SERVICE}"

echo ">>> Project: ${PROJECT_ID}  Region: ${REGION}"
echo ">>> Building API image: ${API_IMAGE}"
gcloud builds submit \
  --project "${PROJECT_ID}" \
  --tag "${API_IMAGE}" \
  --file Dockerfile.api \
  .

echo ">>> Deploying API service: ${API_SERVICE}"
gcloud run deploy "${API_SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --image "${API_IMAGE}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 600 \
  --set-env-vars "CORS_ORIGINS=*"

API_URL=$(gcloud run services describe "${API_SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --format 'value(status.url)')
echo ">>> API URL: ${API_URL}"

echo ">>> Building Web image: ${WEB_IMAGE} (NEXT_PUBLIC_API_BASE=${API_URL})"
gcloud builds submit \
  --project "${PROJECT_ID}" \
  --config frontend/cloudbuild.yaml \
  --substitutions "_API_BASE=${API_URL},_IMAGE=${WEB_IMAGE}" \
  frontend

echo ">>> Deploying Web service: ${WEB_SERVICE}"
gcloud run deploy "${WEB_SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --image "${WEB_IMAGE}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1

WEB_URL=$(gcloud run services describe "${WEB_SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --format 'value(status.url)')

echo ">>> Tightening API CORS to ${WEB_URL}"
gcloud run services update "${API_SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --update-env-vars "CORS_ORIGINS=${WEB_URL}"

echo ""
echo "==================================================="
echo "Deployed."
echo "  API:  ${API_URL}"
echo "  Web:  ${WEB_URL}"
echo "==================================================="
