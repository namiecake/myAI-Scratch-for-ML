variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "cs194-449021"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-west1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "us-west1-a"
}

variable "image_name" {
    description = "Name of the image to be deployed"
    type = string
    default = "client-server"
}

variable "server_registry" {
  description = "Name of the server registry"
  type = string
  default = "myai-api"
}

variable "cloud_task_queue" {
  description = "Name of the cloud task queue for jobs"
  type = string
  default = "myapi-training-queue"
}