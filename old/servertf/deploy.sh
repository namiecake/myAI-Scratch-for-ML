#!/bin/bash

set -e

# echo "Initializing gcloud..."
# gcloud init
gcloud config set project cs194-449021
gcloud config set run/region us-west1

gcloud artifacts repositories create myai-api \
    --repository-format=docker \
    --location=us-west1
# "image name" in terraform will refer to this
gcloud builds submit --tag us-west1-docker.pkg.dev/cs194-449021/myai-api/myai-api

# With the container created, we are ready to provision the pub/sub channel (for compute updates) and 
# creating cloud run service capable of interacting with cloud tasks (provision separately)
terraform apply

# test for publishing to pub/sub
#gcloud config set auth/impersonate_service_account 590321385188-compute@developer.gserviceaccount.com
#gcloud pubsub topics publish compute-updates \
#    --message="your-message"
#gcloud config unset auth/impersonate_service_account