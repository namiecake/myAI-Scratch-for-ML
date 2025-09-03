terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Consolidated service account for Cloud Run
resource "google_service_account" "cloud_run_server_sa" {
  account_id   = "cloud-run-server-sa"
  display_name = "Cloud Run Service Account"
  project      = var.project_id
}

# Consolidated IAM roles for Cloud Run SA
resource "google_project_iam_member" "cloud_run_server_sa_roles" {
  for_each = toset([
    "roles/run.invoker",
    "roles/cloudtasks.enqueuer",
    "roles/cloudtasks.viewer",
    "roles/iam.serviceAccountTokenCreator",  # Consolidated token creator role
    "roles/firebase.admin",
    "roles/firebaseauth.admin"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_run_server_sa.email}"
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "server_cloud_run" {
  name     = "client-server"
  location = var.region

  template {
    service_account = google_service_account.cloud_run_server_sa.email
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.server_registry}/${var.image_name}"
    }
  }
}

# Cloud Run invoker permissions
resource "google_cloud_run_service_iam_binding" "binding" {
  location = google_cloud_run_v2_service.server_cloud_run.location
  service  = google_cloud_run_v2_service.server_cloud_run.name
  role     = "roles/run.invoker"
  members  = [
    "allUsers"  # Consolidated public access
  ]
}

# Cloud Tasks queue
#resource "google_cloud_tasks_queue" "default_queue" {
#  name     = var.cloud_task_queue
#  location = var.region
#  project  = var.project_id

#  rate_limits {
#    max_concurrent_dispatches  = 10
#    max_dispatches_per_second = 500
#  }

#  retry_config {
#    max_attempts  = 5
#    min_backoff   = "1s"
#    max_backoff   = "10s"
#    max_doublings = 4
#  }
#}