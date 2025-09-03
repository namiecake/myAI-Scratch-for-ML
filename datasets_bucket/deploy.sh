#!/bin/bash

set -e

# echo "Initializing gcloud..."
# gcloud init
gcloud config set project cs194-449021
gcloud config set run/region us-west1

#terraform init
terraform apply