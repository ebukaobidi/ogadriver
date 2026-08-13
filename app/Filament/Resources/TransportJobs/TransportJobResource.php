<?php

namespace App\Filament\Resources\TransportJobs;

use App\Filament\Resources\TransportJobs\Pages\CreateTransportJob;
use App\Filament\Resources\TransportJobs\Pages\EditTransportJob;
use App\Filament\Resources\TransportJobs\Pages\ListTransportJobs;
use App\Filament\Resources\TransportJobs\Schemas\TransportJobForm;
use App\Filament\Resources\TransportJobs\Tables\TransportJobsTable;
use App\Models\TransportJob;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TransportJobResource extends Resource
{
    protected static ?string $model = TransportJob::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return TransportJobForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TransportJobsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTransportJobs::route('/'),
            'create' => CreateTransportJob::route('/create'),
            'edit' => EditTransportJob::route('/{record}/edit'),
        ];
    }
}
