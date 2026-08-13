<?php

namespace App\Filament\Resources\TransportJobs\Pages;

use App\Filament\Resources\TransportJobs\TransportJobResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditTransportJob extends EditRecord
{
    protected static string $resource = TransportJobResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
