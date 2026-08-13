<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasIndex('users', 'users_email_index')) {
                $table->index('email');
            }
            if (!Schema::hasIndex('users', 'users_created_at_index')) {
                $table->index('created_at');
            }
        });

        // Drivers table additional indexes
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasIndex('drivers', 'drivers_user_id_index')) {
                $table->index('user_id');
            }
            if (!Schema::hasIndex('drivers', 'drivers_status_index')) {
                $table->index('status');
            }
            if (!Schema::hasIndex('drivers', 'drivers_is_verified_index')) {
                $table->index('is_verified');
            }
            if (!Schema::hasIndex('drivers', 'drivers_state_id_index')) {
                $table->index('state_id');
            }
            if (!Schema::hasIndex('drivers', 'drivers_city_id_index')) {
                $table->index('city_id');
            }
            if (!Schema::hasIndex('drivers', 'drivers_created_at_index')) {
                $table->index('created_at');
            }
            if (!Schema::hasIndex('drivers', 'drivers_rating_index')) {
                $table->index('rating');
            }
            if (!Schema::hasIndex('drivers', 'drivers_total_jobs_index')) {
                $table->index('total_jobs');
            }
        });

        // Bookings table indexes (if exists)
        if (Schema::hasTable('bookings')) {
            Schema::table('bookings', function (Blueprint $table) {
                if (!Schema::hasIndex('bookings', 'bookings_driver_id_index')) {
                    $table->index('driver_id');
                }
                if (!Schema::hasIndex('bookings', 'bookings_hirer_id_index')) {
                    $table->index('hirer_id');
                }
                if (!Schema::hasIndex('bookings', 'bookings_status_index')) {
                    $table->index('status');
                }
                if (!Schema::hasIndex('bookings', 'bookings_created_at_index')) {
                    $table->index('created_at');
                }
                if (!Schema::hasIndex('bookings', 'bookings_pickup_time_index')) {
                    $table->index('pickup_time');
                }
                if (!Schema::hasIndex('bookings', 'bookings_driver_id_status_index')) {
                    $table->index(['driver_id', 'status']);
                }
            });
        }

        // Reviews table indexes (if exists)
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (!Schema::hasIndex('reviews', 'reviews_driver_id_index')) {
                    $table->index('driver_id');
                }
                if (!Schema::hasIndex('reviews', 'reviews_hirer_id_index')) {
                    $table->index('hirer_id');
                }
                if (!Schema::hasIndex('reviews', 'reviews_created_at_index')) {
                    $table->index('created_at');
                }
                if (!Schema::hasIndex('reviews', 'reviews_driver_id_created_at_index')) {
                    $table->index(['driver_id', 'created_at']);
                }
            });
        }

        // Transactions table indexes (if exists)
        if (Schema::hasTable('transactions')) {
            Schema::table('transactions', function (Blueprint $table) {
                if (!Schema::hasIndex('transactions', 'transactions_wallet_id_index')) {
                    $table->index('wallet_id');
                }
                if (!Schema::hasIndex('transactions', 'transactions_created_at_index')) {
                    $table->index('created_at');
                }
                if (!Schema::hasIndex('transactions', 'transactions_type_index')) {
                    $table->index('type');
                }
                if (!Schema::hasIndex('transactions', 'transactions_wallet_id_created_at_index')) {
                    $table->index(['wallet_id', 'created_at']);
                }
            });
        }

        // Driver documents indexes (if exists)
        if (Schema::hasTable('driver_documents')) {
            Schema::table('driver_documents', function (Blueprint $table) {
                if (!Schema::hasIndex('driver_documents', 'driver_documents_driver_id_index')) {
                    $table->index('driver_id');
                }
                if (!Schema::hasIndex('driver_documents', 'driver_documents_document_type_index')) {
                    $table->index('document_type');
                }
                if (!Schema::hasIndex('driver_documents', 'driver_documents_status_index')) {
                    $table->index('status');
                }
                if (!Schema::hasIndex('driver_documents', 'driver_documents_expiry_date_index')) {
                    $table->index('expiry_date');
                }
                if (!Schema::hasIndex('driver_documents', 'driver_documents_driver_id_document_type_index')) {
                    $table->index(['driver_id', 'document_type']);
                }
            });
        }

        // Driver availability indexes (if exists)
        if (Schema::hasTable('driver_availabilities')) {
            Schema::table('driver_availabilities', function (Blueprint $table) {
                if (!Schema::hasIndex('driver_availabilities', 'driver_availabilities_driver_id_index')) {
                    $table->index('driver_id');
                }
                if (!Schema::hasIndex('driver_availabilities', 'driver_availabilities_date_index')) {
                    $table->index('date');
                }
                if (!Schema::hasIndex('driver_availabilities', 'driver_availabilities_status_index')) {
                    $table->index('status');
                }
                if (!Schema::hasIndex('driver_availabilities', 'driver_availabilities_driver_id_date_index')) {
                    $table->index(['driver_id', 'date']);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback indexes
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasIndex('users', 'users_email_index')) {
                $table->dropIndex(['email']);
            }
            if (Schema::hasIndex('users', 'users_created_at_index')) {
                $table->dropIndex(['created_at']);
            }
        });

        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasIndex('drivers', 'drivers_user_id_index')) {
                $table->dropIndex(['user_id']);
            }
            if (Schema::hasIndex('drivers', 'drivers_status_index')) {
                $table->dropIndex(['status']);
            }
            if (Schema::hasIndex('drivers', 'drivers_is_verified_index')) {
                $table->dropIndex(['is_verified']);
            }
            if (Schema::hasIndex('drivers', 'drivers_state_id_index')) {
                $table->dropIndex(['state_id']);
            }
            if (Schema::hasIndex('drivers', 'drivers_city_id_index')) {
                $table->dropIndex(['city_id']);
            }
            if (Schema::hasIndex('drivers', 'drivers_created_at_index')) {
                $table->dropIndex(['created_at']);
            }
            if (Schema::hasIndex('drivers', 'drivers_rating_index')) {
                $table->dropIndex(['rating']);
            }
            if (Schema::hasIndex('drivers', 'drivers_total_jobs_index')) {
                $table->dropIndex(['total_jobs']);
            }
        });

        if (Schema::hasTable('bookings')) {
            Schema::table('bookings', function (Blueprint $table) {
                if (Schema::hasIndex('bookings', 'bookings_driver_id_index')) {
                    $table->dropIndex(['driver_id']);
                }
                if (Schema::hasIndex('bookings', 'bookings_hirer_id_index')) {
                    $table->dropIndex(['hirer_id']);
                }
                if (Schema::hasIndex('bookings', 'bookings_status_index')) {
                    $table->dropIndex(['status']);
                }
                if (Schema::hasIndex('bookings', 'bookings_created_at_index')) {
                    $table->dropIndex(['created_at']);
                }
                if (Schema::hasIndex('bookings', 'bookings_pickup_time_index')) {
                    $table->dropIndex(['pickup_time']);
                }
                if (Schema::hasIndex('bookings', 'bookings_driver_id_status_index')) {
                    $table->dropIndex(['driver_id', 'status']);
                }
            });
        }

        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (Schema::hasIndex('reviews', 'reviews_driver_id_index')) {
                    $table->dropIndex(['driver_id']);
                }
                if (Schema::hasIndex('reviews', 'reviews_hirer_id_index')) {
                    $table->dropIndex(['hirer_id']);
                }
                if (Schema::hasIndex('reviews', 'reviews_created_at_index')) {
                    $table->dropIndex(['created_at']);
                }
                if (Schema::hasIndex('reviews', 'reviews_driver_id_created_at_index')) {
                    $table->dropIndex(['driver_id', 'created_at']);
                }
            });
        }

        if (Schema::hasTable('transactions')) {
            Schema::table('transactions', function (Blueprint $table) {
                if (Schema::hasIndex('transactions', 'transactions_wallet_id_index')) {
                    $table->dropIndex(['wallet_id']);
                }
                if (Schema::hasIndex('transactions', 'transactions_created_at_index')) {
                    $table->dropIndex(['created_at']);
                }
                if (Schema::hasIndex('transactions', 'transactions_type_index')) {
                    $table->dropIndex(['type']);
                }
                if (Schema::hasIndex('transactions', 'transactions_wallet_id_created_at_index')) {
                    $table->dropIndex(['wallet_id', 'created_at']);
                }
            });
        }

        if (Schema::hasTable('driver_documents')) {
            Schema::table('driver_documents', function (Blueprint $table) {
                if (Schema::hasIndex('driver_documents', 'driver_documents_driver_id_index')) {
                    $table->dropIndex(['driver_id']);
                }
                if (Schema::hasIndex('driver_documents', 'driver_documents_document_type_index')) {
                    $table->dropIndex(['document_type']);
                }
                if (Schema::hasIndex('driver_documents', 'driver_documents_status_index')) {
                    $table->dropIndex(['status']);
                }
                if (Schema::hasIndex('driver_documents', 'driver_documents_expiry_date_index')) {
                    $table->dropIndex(['expiry_date']);
                }
                if (Schema::hasIndex('driver_documents', 'driver_documents_driver_id_document_type_index')) {
                    $table->dropIndex(['driver_id', 'document_type']);
                }
            });
        }

        if (Schema::hasTable('driver_availabilities')) {
            Schema::table('driver_availabilities', function (Blueprint $table) {
                if (Schema::hasIndex('driver_availabilities', 'driver_availabilities_driver_id_index')) {
                    $table->dropIndex(['driver_id']);
                }
                if (Schema::hasIndex('driver_availabilities', 'driver_availabilities_date_index')) {
                    $table->dropIndex(['date']);
                }
                if (Schema::hasIndex('driver_availabilities', 'driver_availabilities_status_index')) {
                    $table->dropIndex(['status']);
                }
                if (Schema::hasIndex('driver_availabilities', 'driver_availabilities_driver_id_date_index')) {
                    $table->dropIndex(['driver_id', 'date']);
                }
            });
        }
    }
};
