<?php

namespace App\Filament\Resources\DriverPayoutResource\Pages;

use App\Filament\Resources\DriverPayoutResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDriverPayouts extends ListRecords
{
    protected static string $resource = DriverPayoutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
