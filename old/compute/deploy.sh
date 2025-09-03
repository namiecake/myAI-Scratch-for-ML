#!/bin/bash
INSTANCE_NAME="gpu-training-instance"         
ZONE="us-central1-a"          
USER="jjhung66"
# https://stackoverflow.com/questions/45472882/how-to-authenticate-google-cloud-sdk-on-a-docker-ubuntu-image

####
docker build -t pubsub-listener .
docker run --rm -it pubsub-listener
####
docker run --rm -it -v $HOME/.config/gcloud:/root/.config/gcloud pubsub-listener

gcloud auth configure-docker

docker tag pubsub-listener gcr.io/cs194-449021/pubsub-listener:latest

docker push gcr.io/cs194-449021/pubsub-listener:latest

terraform init

terraform plan -var="project_id=cs194-449021"

terraform apply -var="project_id=cs194-449021" -auto-approve


