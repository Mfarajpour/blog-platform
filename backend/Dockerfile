FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (netcat for health check)
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Make entrypoint executable just in case
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
