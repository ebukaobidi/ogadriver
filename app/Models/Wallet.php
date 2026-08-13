<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Exceptions\InsufficientFundsException;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'available_balance',
        'currency',
        'is_frozen',
        'frozen_at',
        'freeze_reason',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'available_balance' => 'decimal:2',
            'frozen_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function hasAvailableBalance(float $amount): bool
    {
        return $this->available_balance >= $amount;
    }

    public function credit(float $amount, string $type, string $category, string $description, ?string $reference = null): Transaction
    {
        return DB::transaction(function () use ($amount, $type, $category, $description, $reference) {
            // Pessimistic lock on the wallet record
            $lockedWallet = self::where('id', $this->id)->lockForUpdate()->first();
            
            $balanceBefore = $lockedWallet->balance;
            $lockedWallet->increment('balance', $amount);
            $lockedWallet->increment('available_balance', $amount);
            $lockedWallet->refresh();

            return Transaction::create([
                'wallet_id' => $lockedWallet->id,
                'type' => $type,
                'category' => $category,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $this->balance,
                'description' => $description,
                'reference' => $reference ?? uniqid('txn_'),
                'status' => 'completed',
            ]);
        });
    }

    public function debit(float $amount, string $type, string $category, string $description, ?string $reference = null): Transaction
    {
        return DB::transaction(function () use ($amount, $type, $category, $description, $reference) {
            // Pessimistic lock on the wallet record
            $lockedWallet = self::where('id', $this->id)->lockForUpdate()->first();

            if (!$lockedWallet->hasAvailableBalance($amount)) {
                throw new InsufficientFundsException('Insufficient wallet balance');
            }

            $balanceBefore = $lockedWallet->balance;
            $lockedWallet->decrement('balance', $amount);
            $lockedWallet->decrement('available_balance', $amount);
            $lockedWallet->refresh();

            return Transaction::create([
                'wallet_id' => $lockedWallet->id,
                'type' => $type,
                'category' => $category,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $this->balance,
                'description' => $description,
                'reference' => $reference ?? uniqid('txn_'),
                'status' => 'completed',
            ]);
        });
    }

    public function 