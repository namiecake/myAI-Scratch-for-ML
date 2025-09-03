FROM python:3.12-slim

ENV PYTHONUNBUFFERED True

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

ENV APP_HOME /app

WORKDIR $APP_HOME 

COPY . ./

EXPOSE 4000

# this will be run when the image starts. Arguments will be provided after as flags (given as args in the 
# job request)
ENTRYPOINT ["python", "-m", "src.main"]