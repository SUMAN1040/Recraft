#!/usr/bin/env bash
cd backend
source venv/bin/activate
python manage.py migrate
echo "Starting Django API Server on http://127.0.0.1:8000 ..."
python manage.py runserver 127.0.0.1:8000
