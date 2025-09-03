Creates cloud run that runs docker image of the server, also pub/sub channel
This folder contains scripts for creating the cloud run, the docker image (production only), 
a new pub/sub topic channel for compute updates
and scripts to deploy the docker images to google

Pub/sub needs permissions to directly message this cloud run endpoint, and the cloud run needs to have google cloud 
tasks permission

NOTE!!: Please start the job processor FIRST and retrieve the URL endpoint for it, which we place in the router
of the server. This is necessary so that cloud tasks knows where to send a job