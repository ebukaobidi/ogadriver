<?php

namespace App\Filament\Resources\DriverDocuments\Pages;

use App\Filament\Resources\DriverDocuments\DriverDocumentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListDriverDocuments extends ListRecords
{
    protected static string $resource = DriverDocumentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
