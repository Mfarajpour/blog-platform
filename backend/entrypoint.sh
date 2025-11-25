#!/bin/sh

# Extract host from DATABASE_URL or default to postgres-service
# Simple logic: assume we are in k8s environment now
DB_HOST="postgres-service"

echo "Waiting for postgres at $DB_HOST..."
while ! nc -z $DB_HOST 5432; do
  sleep 1
done
echo "PostgreSQL started"

echo "Running Migrations..."
export FLASK_APP=run.py
flask db upgrade

echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:5000 run:app
