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

# start a cloud run instance
resource "google_service_account" "job_processor_service_account" {
  account_id   = "vertex-tasks-sa"
  display_name = "Service Account for Cloud Run with Vertex AI permissions"
  project      = var.project_id
}

# Assign necessary IAM roles to the service account
resource "google_project_iam_member" "tasks_sa_roles" {
  for_each = toset([
    "roles/cloudtasks.enqueuer",        # Allows creating/managing tasks
    "roles/aiplatform.user",            # Basic Vertex AI usage
    "roles/aiplatform.serviceAgent",    # Allows service account to act as Vertex AI
    "roles/compute.serviceAgent",        # Required for Vertex AI compute resources
    "roles/storage.objectViewer"        # Access to model artifacts in GCS
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.job_processor_service_account.email}"
}

# permit this service account to be impersonated
resource "google_project_iam_binding" "sa_token_creator" {
    project = var.project_id
    role = "roles/iam.serviceAccountTokenCreator"
    members = ["serviceAccount:${google_service_account.job_processor_service_account.email}"]
}

resource "google_cloud_run_v2_service" "job_processor_cloud_run" {
    name = "job-processor-cloud-run"
    location = var.region

    template {
        service_account = google_service_account.job_processor_service_account.email
        containers {
            image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.image_name}/${var.image_name}"
            #env {
                # can set environment vars here if needed
                # name = ""
                # value = ""
            #}
        }
    }

    depends_on = [google_service_account.job_processor_service_account, google_project_iam_binding.sa_token_creator]
}

# enable access to endpoint publicly. IF WE WANT TO RESTRICT TO ONLY CLOUD RUN/CLOUD TASKS, need to specify member as 
# the service accounts used by the cloud tasks or cloud run servers
resource "google_cloud_run_v2_service_iam_member" "server_public_access" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.job_processor_cloud_run.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

### VERTEX STAGING bucket
# Create the bucket
resource "google_storage_bucket" "vertex_staging" {
    name     = "${var.project_id}-vertex-ai-staging"
    location = var.region
    project  = var.project_id
}

data "google_project" "project" {
    project_id = var.project_id
}

# give bucket access permissions to the vertex instance
# we use the vertex ai's internal service identity here as opposed to the service account it impersonates since this is involved in GCS access
resource "google_project_iam_member" "vertex_storage_access" {
    project = var.project_id
    role    = "roles/storage.admin"
    member  = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}
