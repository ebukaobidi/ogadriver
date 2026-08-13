# Ogadriver.ng - Enterprise Driver Marketplace

<p align="center">
A dominant, enterprise-grade Drivers Listing Portal built with Laravel 12
</p>

## Overview

Ogadriver.ng is a comprehensive driver marketplace platform connecting hirers with professional drivers across Nigeria. The platform features real-time geospatial tracking, algorithmic driver prioritization, multi-split escrow payments, and automated compliance management.

## Features

### Core Functionality
- **Geospatial Driver Tracking** - Redis-based real-time location tracking with GEOADD/GEOSEARCH
- **Algorithmic Prioritization** - Pro driver queue with scoring based on rating, experience, and completion rate
- **Multi-Split Escrow Wallet** - Secure payment holding with automatic release on job completion
- **OCR Document Parsing** - AWS Textract integration for automated document verification
- **Compliance Automation** - Automated expiry watchdog with driver deactivation
- **Real-time Broadcasting** - Laravel Reverb WebSockets for instant job alerts
- **Subscription Tiers** - Driver Pro, Corporate, and Enterprise monetization

### API Endpoints

#### Public Directories
- `GET /api/driving-schools` - Accredited driving school listings
- `GET /api/executive-car-hires` - Premium executive car hire services
- `GET /api/search/drivers` - Geospatial driver search with filters
- `GET /api/search/jobs` - Job search with early access for Pro drivers
- `GET /api/search/heatmap` - Driver density heatmap
- `GET /api/search/driver-count` - Online driver count in area

#### Protected API (Authentication Required)
- `GET /api/drivers` - Driver management
- `GET /api/jobs` - Job management
- `GET /api/disputes` - Dispute resolution
- `GET /api/favorites` - Favorite driver pools
- `GET /api/wallet` - Wallet operations
- `GET /api/telemetry` - System metrics (admin)

## Installation

### Prerequisites
- PHP 8.2+
- MySQL 8.0+
- Redis
- Composer

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd ogadriver.com
```

2. Install dependencies
```bash
composer install
```

3. Configure environment
```bash
cp .env.example .env
```

Update `.env` with your database credentials:
```
DB_DATABASE=ogadriver
DB_USERNAME=root
DB_PASSWORD=
```

4. Generate application key
```bash
php artisan key:generate
```

5. Run migrations
```bash
php artisan migrate
```

6. Configure Redis connection in `.env`:
```
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

7. Start the scheduler (for production):
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

## Services

### DriverLocationService
Real-time geospatial tracking using Redis GEO commands for driver location management and nearby driver search.

### DriverPrioritizationService
Algorithmic priority scoring system that ranks drivers based on Pro status, rating, experience, completion rate, and recency.

### SubscriptionService
Complete subscription tier management with prorated upgrades, renewals, and commission rate calculation.

### DocumentParsingService
AWS Textract OCR integration for automatic extraction of data from driver documents.

### TelemetryService
Real-time system metrics collection for admin dashboard with historical data analysis.

## Background Jobs

### CheckDocumentExpiry
Automated compliance watchdog that runs daily at midnight to:
- Check for expired driver documents and deactivate affected drivers
- Send expiry warning notifications
- Process expired subscriptions and downgrade tiers

## WebSocket Events

- `JobBroadcasted` - Real-time job alerts to nearby drivers
- `JobAssigned` - Driver assignment notification
- `JobStarted` - Job commencement notification
- `JobCompleted` - Job completion with payment release
- `JobCancelled` - Job cancellation with refund processing
- `DriverLocationUpdated` - Location updates to favoriting hirers

## Admin Panel

Filament PHP admin panel resources for:
- Driver management
- Document verification
- Job oversight
- Dispute resolution
- Subscription management
- System telemetry

## Security

- Laravel Sanctum for API authentication
- Role-based access control (Admin, Driver, Hirer)
- Escrow payment system for transaction security
- Document verification workflow
- Dispute resolution with audit trails

## License

Proprietary - All rights reserved

## Support

For support, contact the Ogadriver.ng development team.

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
