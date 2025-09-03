import googleapiclient.discovery
import time
import os
import paramiko
from google.cloud import storage, iam

# ------------------------------
# CONFIGURATION
# ------------------------------
PROJECT_ID = "cs194-449021"
ZONE = "us-west1"  # Change based on your preference
INSTANCE_NAME = "gpu-training-instance"
MACHINE_TYPE = "n1-standard-4"  # Adjust based on your needs
GPU_TYPE = "nvidia-tesla-t4"
GPU_COUNT = 1
STARTUP_SCRIPT = """#!/bin/bash
sudo apt update && sudo apt install -y python3-pip git
pip3 install -r /home/deploy/requirements.txt
nohup python3 /home/deploy/listener.py > /home/deploy/listener.log 2>&1 &
"""
LOCAL_CODE_DIR = "./your-local-code-dir"
REMOTE_CODE_DIR = "/home/deploy"

# ------------------------------
# CREATE COMPUTE INSTANCE
# ------------------------------
compute = googleapiclient.discovery.build("compute", "v1")

def create_instance():
    config = {
        "name": INSTANCE_NAME,
        "machineType": f"zones/{ZONE}/machineTypes/{MACHINE_TYPE}",
        "disks": [
            {
                "boot": True,
                "initializeParams": {
                    "sourceImage": "projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts",
                    "diskSizeGb": "50",
                },
            }
        ],
        "networkInterfaces": [{"network": "global/networks/default"}],
        "guestAccelerators": [
            {
                "acceleratorCount": GPU_COUNT,
                "acceleratorType": f"zones/{ZONE}/acceleratorTypes/{GPU_TYPE}",
            }
        ],
        "serviceAccounts": [
            {
                "email": "default",
                "scopes": ["https://www.googleapis.com/auth/cloud-platform"],
            }
        ],
        "metadata": {
            "items": [{"key": "startup-script", "value": STARTUP_SCRIPT}]
        },
    }

    request = compute.instances().insert(project=PROJECT_ID, zone=ZONE, body=config)
    request.execute()
    print(f"🚀 Creating instance '{INSTANCE_NAME}'...")

    # Wait for instance to be running
    time.sleep(30)
    return True

# ------------------------------
# ASSIGN IAM ROLE TO INSTANCE
# ------------------------------
def assign_iam_roles():
    client = iam.IAMClient()
    service_account_email = f"{INSTANCE_NAME}@{PROJECT_ID}.iam.gserviceaccount.com"

    policy = client.get_iam_policy(request={"resource": f"projects/{PROJECT_ID}"})
    policy.bindings.append(
        {"role": "roles/pubsub.subscriber", "members": [f"serviceAccount:{service_account_email}"]}
    )
    policy.bindings.append(
        {"role": "roles/pubsub.publisher", "members": [f"serviceAccount:{service_account_email}"]}
    )

    client.set_iam_policy(request={"resource": f"projects/{PROJECT_ID}", "policy": policy})
    print(f"✅ Assigned Pub/Sub roles to {service_account_email}")

# ------------------------------
# UPLOAD LOCAL CODE TO INSTANCE
# ------------------------------
def upload_code(instance_ip):
    key = paramiko.RSAKey(filename="~/.ssh/google_compute_engine")  # Change if using a different SSH key
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    print(f"🔄 Connecting to {instance_ip}...")
    ssh.connect(instance_ip, username="ubuntu", pkey=key)

    sftp = ssh.open_sftp()
    for file in os.listdir(LOCAL_CODE_DIR):
        local_file = os.path.join(LOCAL_CODE_DIR, file)
        remote_file = os.path.join(REMOTE_CODE_DIR, file)
        print(f"📤 Uploading {file}...")
        sftp.put(local_file, remote_file)
    
    sftp.close()
    ssh.close()
    print("✅ Code uploaded successfully.")

# ------------------------------
# DEPLOYMENT FUNCTION
# ------------------------------
def deploy():
    create_instance()
    assign_iam_roles()

    # Get external IP
    instance = compute.instances().get(project=PROJECT_ID, zone=ZONE, instance=INSTANCE_NAME).execute()
    instance_ip = instance["networkInterfaces"][0]["accessConfigs"][0]["natIP"]

    upload_code(instance_ip)

    print(f"🚀 Deployment complete! Compute instance running at {instance_ip}")

if __name__ == "__main__":
    deploy()
