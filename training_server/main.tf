terraform {
    required_providers {
        google = {
            source = "hashicorp/google"
            version = "~> 5.0"
        }
    }
}

provider "google" {
    project = var.project_id
    region = var.region
}

# start a cloud run instance
resource "google_service_account" "training_server_sa" {
  account_id   = "training-server-sa"
  display_name = "Service Account for Cloud Run with Vertex AI permissions"
  project      = var.project_id
}

# Assign necessary IAM roles to the service account
resource "google_project_iam_member" "tasks_sa_roles" {
  for_each = toset([
    "roles/cloudtasks.enqueuer",        # Allows creating/managing tasks
    "roles/compute.serviceAgent",        
    "roles/storage.objectViewer",        # Access to model artifacts in GCS
    "roles/storage.objectAdmin"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.training_server_sa.email}"
}

# permit this service account to be impersonated
resource "google_project_iam_binding" "sa_token_creator" {
    project = var.project_id
    role = "roles/iam.serviceAccountTokenCreator"
    members = ["serviceAccount:${google_service_account.training_server_sa.email}"]
}

resource "google_cloud_run_v2_service" "training_server" {
    name = "training-server"
    location = var.region

    template {
        execution_environment = "EXECUTION_ENVIRONMENT_GEN1"
        service_account = google_service_account.training_server_sa.email
        
        containers {
            image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.server_registry}/${var.image_name}"
            #env {
                # can set environment vars here if needed
                # name = ""
                # value = ""
            #}
            resources {
                cpu_idle = true
                limits = {
                    cpu = "2"
                    memory = "8Gi"
                }
            }
        }
        scaling {
            min_instance_count = 0
            max_instance_count = 10
        }
    }

    depends_on = [google_service_account.training_server_sa, google_project_iam_binding.sa_token_creator]
}

# enable access to endpoint publicly. IF WE WANT TO RESTRICT TO ONLY CLOUD RUN/CLOUD TASKS, need to specify member as 
# the service accounts used by the cloud tasks or cloud run servers
resource "google_cloud_run_v2_service_iam_member" "server_public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.training_server.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}