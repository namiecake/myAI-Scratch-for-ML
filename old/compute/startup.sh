#!/bin/bash

# Update the package list
sudo apt-get update -y

# Install Python 3 and pip
sudo apt-get install -y python3 python3-pip

# Verify Python installation
python3 --version
pip3 --version

# Optionally, install some common Python packages (remove or add as needed)
sudo apt-get install -y python3-venv python3-dev

