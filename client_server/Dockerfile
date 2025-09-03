FROM python:3.12-slim

ENV PYTHONUNBUFFERED True

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

ENV APP_HOME /app

WORKDIR $APP_HOME 

COPY . ./

# EXPOSE 4000

# start the server
# CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT} --forwarded-allow-ips "*"
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080", "--proxy-headers", "--forwarded-allow-ips", "*"]
