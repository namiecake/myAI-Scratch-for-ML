FROM python:3.12-slim

ENV PYTHONUNBUFFERED True

# since docker works layer by layer, copying requirements.txt first means it can cache it so if no changes
# are made it will not have to do pip install all over again (i.e. rebuild layers after this)
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

ENV APP_HOME /app

WORKDIR $APP_HOME 

# everything is now in directory /app/
COPY . ./

# Below is actually just pure documentation purposes. It does not affect runtime
# EXPOSE ${PORT}

# start the server. Searches for object "app" in /app/src/main.py and runs it 
# Port is based on environment variable since GCR has it set itself
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers