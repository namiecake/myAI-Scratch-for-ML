#!/bin/bash

set -e

# echo "Initializing gcloud..."
# gcloud init
gcloud config set project cs194-449021
gcloud config set run/region us-west1

gcloud artifacts repositories create myai-job-processor \
    --repository-format=docker \
    --location=us-west1
# "image name" in terraform will refer to this
gcloud builds submit --tag us-west1-docker.pkg.dev/cs194-449021/myai-job-processor/myai-job-processor

# With the container created, we are ready to provision the pub/sub channel (for compute updates) and 
# creating cloud run service capable of interacting with cloud tasks (provision separately)
terraform init
terraform apply