terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ------------------------------
# 1️⃣ Create Service Account
# ------------------------------
resource "google_service_account" "gpu_instance_sa" {
  account_id   = "gpu-instance-sa"
  display_name = "GPU Compute Instance Service Account"
}

# ------------------------------
# 2️⃣ Assign Pub/Sub and Compute Permissions
# ------------------------------
resource "google_project_iam_binding" "pubsub_roles" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"

  members = [
    "serviceAccount:${google_service_account.gpu_instance_sa.email}"
  ]
}

resource "google_project_iam_binding" "pubsub_publisher" {
  project = var.project_id
  role    = "roles/pubsub.publisher"

  members = [
    "serviceAccount:${google_service_account.gpu_instance_sa.email}"
  ]
}

resource "google_project_iam_binding" "viewer_role" {
  project = var.project_id
  role    = "roles/viewer"

  members = [
    "serviceAccount:${google_service_account.gpu_instance_sa.email}"
  ]
}

# ------------------------------
# 3️⃣ Create GCP Compute Instance with GPU & Docker
# ------------------------------
resource "google_compute_instance" "gpu_instance" {
  name         = "gpu-training-instance"
  machine_type = "n1-standard-4"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts"
      size  = 50
    }
  }

  network_interface {
    network = "default"
    access_config {}  # Enables internet access
  }

  scheduling {
    on_host_maintenance = "TERMINATE"
    automatic_restart   = true
  }

  guest_accelerator {
    type  = "nvidia-tesla-t4"
    count = 1
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    sudo apt update && sudo apt install -y docker.io
    sudo usermod -aG docker $USER
    newgrp docker
    gcloud auth configure-docker --quiet
    docker pull gcr.io/${var.project_id}/pubsub-listener:latest
    docker run --rm -it \
      -e GOOGLE_APPLICATION_CREDENTIALS="/etc/gcloud-service-key.json" \
      -v /etc/gcloud-service-key.json:/etc/gcloud-service-key.json \
      gcr.io/${var.project_id}/pubsub-listener:latest
  EOT

  service_account {
    email  = google_service_account.gpu_instance_sa.email
    scopes = ["cloud-platform"]
  }

  tags = ["gpu", "training", "pubsub"]
}

# ------------------------------
# 4️⃣ Output Instance IP
# ------------------------------
output "instance_ip" {
  value = google_compute_instance.gpu_instance.network_interface.0.access_config.0.nat_ip
}
