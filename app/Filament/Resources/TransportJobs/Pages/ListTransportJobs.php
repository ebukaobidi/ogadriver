<?php

namespace App\Filament\Resources\TransportJobs\Pages;

use App\Filament\Resources\TransportJobs\TransportJobResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTransportJobs extends ListRecords
{
    protected static string $resource = TransportJobResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
