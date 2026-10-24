<?php

namespace App\Filament\Resources\Regions;

use App\Filament\Resources\Regions\Pages;
use App\Models\Region;
use BackedEnum;
use UnitEnum;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class RegionResource extends Resource
{
    protected static ?string $model = Region::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-globe-alt';
    protected static string|UnitEnum|null $navigationGroup = 'Settings';
    protected static ?string $navigationLabel = 'Regions & Currencies';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->placeholder('Lagos'),
                Forms\Components\TextInput::make('country_code')
                    ->default('NG')
                    ->maxLength(2),
                Forms\Components\TextInput::make('currency_code')
                    ->default('NGN')
                    ->maxLength(3),
                Forms\Components\TextInput::make('currency_symbol')
                    ->default('₦')
                    ->maxLength(5),
                Forms\Components\TextInput::make('base_rate_per_km')
                    ->numeric()
                    ->default(250.00),
                Forms\Components\TextInput::make('base_rate_per_minute')
                    ->numeric()
                    ->default(30.00),
                Forms\Components\TextInput::make('minimum_fare')
                    ->numeric()
                    ->default(1000.00),
                Forms\Components\Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('country_code'),
                Tables\Columns\TextColumn::make('currency_symbol'),
                Tables\Columns\TextColumn::make('base_rate_per_km')->money('NGN'),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRegions::route('/'),
        ];
    }
}
