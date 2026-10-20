<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Hirer;

class EscrowTest extends TestCase
{
    use RefreshDatabase;

    public function test_funds_can_be_held_in_escrow()
    {
        $user = User::factory()->create();
        $wallet = Wallet::factory()->create(['user_id' => $user->id, 'available_balance' => 50000, 'escrow_balance' => 0]);

        $wallet->holdInEscrow(15000);

        $this->assertEquals(35000, $wallet->fresh()->available_balance);
        $this->assertEquals(15000, $wallet->fresh()->escrow_balance);
    }
}
