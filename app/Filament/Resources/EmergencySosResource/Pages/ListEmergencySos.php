<?php

namespace App\Filament\Resources\EmergencySosResource\Pages;

use App\Filament\Resources\EmergencySosResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEmergencySos extends ListRecords
{
    protected static string $resource = EmergencySosResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
