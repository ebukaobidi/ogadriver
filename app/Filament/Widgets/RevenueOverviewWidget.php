<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Subscription;
use App\Models\User;

class RevenueOverviewWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $totalSubscriptionRevenue = Subscription::where('status', 'active')->sum('amount');
        $activeSubscribers = Subscription::where('status', 'active')->count();
        $referralRewardsPaid = User::sum('referral_rewarded');

        return [
            Stat::make('Total Subscription Revenue', '₦' . number_format($totalSubscriptionRevenue, 2))
                ->description('All time active subscription revenue')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->chart([7, 2, 10, 3, 15, 4, 17])
                ->color('success'),
            Stat::make('Active Subscribers', $activeSubscribers)
                ->description('Currently active paying users')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),
            Stat::make('Referral Rewards Paid', '₦' . number_format($referralRewardsPaid, 2))
                ->description('Total rewards paid to users')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('warning'),
        ];
    }
}
