terraform {
    required_providers {
        google = {
            source = "hashicorp/google"
            version = "~> 4.0"
        }
    }
}

provider "google" {
    project = var.project_id
    region = var.region
}

# Create the GCS bucket
resource "google_storage_bucket" "datasets_bucket" {
  name     = "myai-datasets-bucket"
  location = var.region
  project  = var.project_id
  force_destroy = true

  provisioner "local-exec" {
    # path.module - terraform knows this as the directory in which this file (main.tf) is located
    command = "gsutil -m cp -r ${path.module}/datasets/* gs://${google_storage_bucket.datasets_bucket.name}/"
  }
}