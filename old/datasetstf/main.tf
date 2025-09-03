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

# Grant Vertex AI API permissions to read from GCS
resource "google_project_service_identity" "vertex_sa" {
  provider = google-beta
  project  = var.project_id
  service  = "aiplatform.googleapis.com"
}

# Grant permissions to Vertex AI service account
resource "google_project_iam_member" "vertex_gcs_access" {
  for_each = toset([
    "roles/storage.objectViewer",     # Read access to GCS objects
    # Add "roles/storage.objectCreator" if Vertex AI needs to write to GCS
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_project_service_identity.vertex_sa.email}"
}

# If you want to restrict access to specific buckets instead of project-wide:
#resource "google_storage_bucket_iam_member" "vertex_bucket_access" {
#  bucket = google_storage_bucket.datasets_bucket.name
#  role   = "roles/storage.objectViewer"
#  member = "serviceAccount:${google_project_service_identity.vertex_sa.email}"
#}