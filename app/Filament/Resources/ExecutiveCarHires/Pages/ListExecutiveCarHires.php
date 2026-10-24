<?php

namespace App\Filament\Resources\ExecutiveCarHires\Pages;

use App\Filament\Resources\ExecutiveCarHires\ExecutiveCarHireResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListExecutiveCarHires extends ListRecords
{
    protected static string $resource = ExecutiveCarHireResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
