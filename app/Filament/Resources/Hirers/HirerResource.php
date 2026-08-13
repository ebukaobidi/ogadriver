<?php

namespace App\Filament\Resources\Hirers;

use App\Filament\Resources\Hirers\Pages\CreateHirer;
use App\Filament\Resources\Hirers\Pages\EditHirer;
use App\Filament\Resources\Hirers\Pages\ListHirers;
use App\Filament\Resources\Hirers\Schemas\HirerForm;
use App\Filament\Resources\Hirers\Tables\HirersTable;
use App\Models\Hirer;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class HirerResource extends Resource
{
    protected static ?string $model = Hirer::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'company_name';

    public static function form(Schema $schema): Schema
    {
        return HirerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return HirersTable::configure($table);
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
            'index' => ListHirers::route('/'),
            'create' => CreateHirer::route('/create'),
            'edit' => EditHirer::route('/{record}/edit'),
        ];
    }
}
