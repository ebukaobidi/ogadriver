<?php

namespace App\Filament\Resources\FuelPrices\Pages;

use App\Filament\Resources\FuelPrices\FuelPriceResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFuelPrices extends ListRecords
{
    protected static string $resource = FuelPriceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
