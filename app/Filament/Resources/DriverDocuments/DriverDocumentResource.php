<?php

namespace App\Filament\Resources\DriverDocuments;

use App\Filament\Resources\DriverDocuments\Pages\CreateDriverDocument;
use App\Filament\Resources\DriverDocuments\Pages\EditDriverDocument;
use App\Filament\Resources\DriverDocuments\Pages\ListDriverDocuments;
use App\Filament\Resources\DriverDocuments\Schemas\DriverDocumentForm;
use App\Filament\Resources\DriverDocuments\Tables\DriverDocumentsTable;
use App\Models\DriverDocument;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DriverDocumentResource extends Resource
{
    protected static ?string $model = DriverDocument::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'document_type';

    public static function form(Schema $schema): Schema
    {
        return DriverDocumentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DriverDocumentsTable::configure($table);
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
            'index' => ListDriverDocuments::route('/'),
            'create' => CreateDriverDocument::route('/create'),
            'edit' => EditDriverDocument::route('/{record}/edit'),
        ];
    }
}
