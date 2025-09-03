# Use an official lightweight Python image as a base
FROM python:3.10-slim

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV GCLOUD_VERSION=450.0.0 

# Set the working directory inside the container
WORKDIR /app

COPY . /app
COPY service_account.json /app/service_account.json
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/service_account.json"

# Install dependencies: gcloud CLI & necessary system packages
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    apt-transport-https \
    && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - \
    && echo "deb https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list \
    && apt-get update && apt-get install -y google-cloud-sdk \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the requirements file first for caching
COPY requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project (including listener.py) into the container
COPY . .

# Ensure the listener script is executable
RUN chmod +x src/main.py

# Command to start the listener when the container runs
CMD ["python", "src/main.py"]
