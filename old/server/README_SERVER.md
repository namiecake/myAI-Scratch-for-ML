Notes to try deployment:
If you are trying to deploy the backend, first run the docker container locally via vscode (you have to install docker desktop first). Then, go to deploy.sh and uncomment "gcloud init". Then run the script and follow instructions.

### Run Commands

# build the Docker image

docker build -t my-ai . -f Dockerfile.local

# create and run a container on port 8000 based on the image

docker run -p 8000:8000 my-ai
