#!/bin/bash

set -e

# echo "Initializing gcloud..."
# gcloud init
gcloud config set project cs194-449021
gcloud config set run/region us-west1

gcloud artifacts repositories create myai-model-code \
    --repository-format=docker \
    --location=us-west1


gcloud builds submit --tag us-west1-docker.pkg.dev/cs194-449021/myai-model-code/myai-model-code
