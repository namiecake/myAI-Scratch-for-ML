gcloud config set project cs194-449021
gcloud config set run/region us-west1

# Deploy to Artifact Registry
# gcloud artifacts repositories create myai-api \
#     --repository-format=docker \
#     --location=us-west1


gcloud builds submit --tag us-west1-docker.pkg.dev/cs194-449021/myai-api/client-server

# Enable necessary services for Cloud Run
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# Deploy to Cloud Run
gcloud run deploy client-server \
    --image us-west1-docker.pkg.dev/cs194-449021/myai-api/client-server \
    --platform managed \
    --region us-west1 \
    --allow-unauthenticated