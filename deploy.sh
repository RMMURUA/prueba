#!/bin/bash



echo "Desplegando Microservicio"

gcloud builds submit --tag gcr.io/speaknosis-backend/speaknosis-backend:0.0.2

gcloud beta run services replace deployment.yaml --platform managed --region us-central1