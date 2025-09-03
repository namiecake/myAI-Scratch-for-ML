#!/bin/bash

set -e

# echo "Initializing gcloud..."
# gcloud init

# Create a Docker artifact repository
echo "Creating artifact repository 'myai-api'..."
# gcloud artifacts repositories create myai-api \
#   --repository-format=docker \
#   --project=cs194-449021 \
#   --location=us-west1

# Submit a Cloud Build
echo "Submitting build using cloudbuild.yaml..."
gcloud builds submit --config=cloudbuild.yaml --project=cs194-449021

# Deploy the service using a configuration file
echo "Replacing Cloud Run service with 'service.yaml'..."
gcloud run services replace service.yaml --region=us-west1

# Set IAM policy for the Cloud Run service
echo "Setting IAM policy for 'myai-api-service'..."
gcloud run services set-iam-policy myai-api-service gcr-service-policy.yaml --region=us-west1

echo "Deployment complete!"

# all services can be seen in "Cloud Run" and "Artifacts Registry" of GCP