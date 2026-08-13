# Production Deployment Guide - Namecheap Shared Hosting

## Prerequisites
- PHP 8.4.1 or higher
- MySQL database
- SSL certificate (HTTPS)

## 1. Environment Configuration

Create/Edit `.env` file on production:

```bash
APP_NAME=Ogadriver
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://ogadriver.ng

# Frontend Configuration
FRONTEND_URL=https://ogadriver.ng

# Database Configuration (Namecheap MySQL)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Payment Gateway (Configure via Admin Panel after deployment)
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_CALLBACK_URL="https://ogadriver.ng/api/payments/callback"

# AI Services (Optional - Configure via Admin Panel)
AI_SERVICE_PROVIDER=google
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_SPEECH_API_KEY=
GOOGLE_MAPS_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AWS Services (Optional - Configure via Admin Panel)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
```

## 2. Generate Application Key

```bash
php artisan key:generate
```

## 3. Database Setup

### Create database via cPanel/phpMyAdmin:
1. Log into cPanel
2. Go to MySQL Database Wizard
3. Create database (e.g., `ogadriver_prod`)
4. Create database user with strong password
5. Grant all privileges to user on database

### Import database schema:
```bash
php artisan migrate --force
```

### Seed initial data (optional):
```bash
php artisan db:seed --force
```

## 4. File Permissions

Set proper permissions for shared hosting:

```bash
# Storage directory
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# Make writable
chmod -R 777 storage/logs
chmod -R 777 storage/framework
chmod -R 777 bootstrap/cache
```

## 5. Clear and Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 6. Frontend Build

Build the React frontend for production:

```bash
cd frontend
npm install
npm run build
cd ..
```

The build output will be in `frontend/dist/`

## 7. Configure Public Directory

Ensure your public directory structure:

```
public/
├── index.php (Laravel entry point)
├── .htaccess
└── (other Laravel public files)
```

For SPA routing, create/update `public/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Handle API routes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^api/(.*)$ index.php [L,QSA]
    
    # Handle all other requests to React app
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ frontend/dist/index.html [L]
</IfModule>
```

## 8. SSL/HTTPS Configuration

1. Enable SSL in cPanel (Let's Encrypt or custom SSL)
2. Force HTTPS by adding to `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 9. Configure Paystack

After deployment:

1. Log into admin panel at `https://ogadriver.ng/admin/settings/api`
2. Navigate to "Payment Gateway" section
3. Add Paystack keys:
   - **Public Key**: From Paystack dashboard
   - **Secret Key**: From Paystack dashboard
4. Save settings

5. In Paystack dashboard, set callback URL:
   - `https://ogadriver.ng/api/payments/callback`

## 10. Security Checklist

- [ ] `APP_DEBUG=false` in `.env`
- [ ] Strong `APP_KEY` generated
- [ ] Database credentials secure
- [ ] SSL/HTTPS enabled
- [ ] File permissions set correctly
- [ ] API keys configured via admin panel (not in .env)
- [ ] CORS configured for production domain
- [ ] Firewall rules in place (if available)

## 11. Post-Deployment Testing

Test the following:
- [ ] Homepage loads correctly
- [ ] User registration/login works
- [ ] Admin panel accessible
- [ ] API endpoints responding
- [ ] File uploads working
- [ ] Payment flow (with test mode)
- [ ] Email notifications (if configured)

## 12. Monitoring

Set up error logging:
```bash
tail -f storage/logs/laravel.log
```

## Troubleshooting

### 500 Internal Server Error
- Check `.env` file exists and is configured
- Verify file permissions
- Check `storage/logs/laravel.log` for errors

### Database Connection Error
- Verify database credentials in `.env`
- Ensure MySQL service is running
- Check database exists and user has privileges

### Payment Gateway Not Working
- Verify Paystack keys in admin panel
- Check callback URL matches Paystack dashboard
- Ensure webhook secret is configured (if using webhooks)

## Namecheap-Specific Notes

- PHP Selector: Set to PHP 8.4 or higher
- Document Root: Point to `public/` directory
- Max Upload Size: May need to increase via `.htaccess`:
  ```apache
  php_value upload_max_filesize 20M
  php_value post_max_size 20M
  ```
