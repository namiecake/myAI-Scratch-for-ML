from google.cloud import pubsub_v1
import json
from dotenv import load_dotenv
import os

dotenv_path = os.path.join(os.path.dirname(__file__), "../../.env")
dotenv_path = os.path.abspath(dotenv_path)
load_dotenv(dotenv_path)

project_id = os.getenv("PROJECT_ID")
subscription_id = os.getenv("SUBSCRIPTION_ID")
topic_id = os.getenv("TOPIC_ID")
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_id)

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(project_id, subscription_id)

def callback(message):
    data = json.loads(message.data.decode("utf-8"))
    print(f"Received training request: {data}")
    
    '''
    # Extract parameters
    model_name = data["model_name"]
    dataset_path = data["dataset_path"]
    
    # Start training (replace with actual training logic)
    train_model(model_name, dataset_path)
    ''' 
    send_training_update(data["execution"])

    message.ack()  # Acknowledge the message

def send_training_update(exec_type):
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, "train-updates")

    message_data = {
        "execution_type": exec_type,
    }

    message_json = json.dumps(message_data).encode("utf-8")
    future = publisher.publish(topic_path, message_json)
    print(f"Sent training update: {future.result()}")

print("Listening for training requests...")
subscriber.subscribe(subscription_path, callback=callback)

import time
while True:
    time.sleep(60)

# need to run this in the background to permit training