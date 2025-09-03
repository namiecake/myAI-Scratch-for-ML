This directory is to be built into the container that houses the code for generating and
training AI code. It will be deployed to vertex AI jobs.

Script needs to: send training updates to pub/sub channel (Q: can the vertex job send messages to pub/sub endpoint?)
It also needs to extract datasets

As of now the models are not saved. Only updates that happen are the ones being sent to pub/sub

Usage arguments:
--dataset: name of dataset to use
--model-config: model configurations