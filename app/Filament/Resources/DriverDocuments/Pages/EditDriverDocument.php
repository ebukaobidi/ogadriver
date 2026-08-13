<?php

namespace App\Filament\Resources\DriverDocuments\Pages;

use App\Filament\Resources\DriverDocuments\DriverDocumentResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditDriverDocument extends EditRecord
{
    protected static string $resource = DriverDocumentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
