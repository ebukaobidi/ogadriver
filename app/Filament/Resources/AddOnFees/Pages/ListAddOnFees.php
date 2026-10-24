<?php

namespace App\Filament\Resources\AddOnFees\Pages;

use App\Filament\Resources\AddOnFees\AddOnFeeResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAddOnFees extends ListRecords
{
    protected static string $resource = AddOnFeeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
