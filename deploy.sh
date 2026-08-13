#!/bin/bash

# Deployment script for Ogadriver
# Usage: ./deploy.sh

set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
composer install --no-interaction --prefer-dist --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build frontend
cd frontend
npm install
npm run build
cd ..

echo "Deployment finished successfully!"
