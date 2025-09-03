Install Terraform to Computer
Then Run the deploy.sh script to create compute engine
(currently no process for creating bucket with dataset and connecting (need to do that))

To get available compute: gcloud compute accelerator-types list.
TODO: compute is hardly ever available with GPU. I currently have GPU commented out, can include this later or we might
switch to alternative platform

Do terraform destroy to remove all resources