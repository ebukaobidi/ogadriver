<?php

namespace App\Filament\Resources\Hirers\Pages;

use App\Filament\Resources\Hirers\HirerResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditHirer extends EditRecord
{
    protected static string $resource = HirerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
