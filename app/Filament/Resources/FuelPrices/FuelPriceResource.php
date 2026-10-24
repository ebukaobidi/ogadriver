<?php

namespace App\Filament\Resources\FuelPrices;

use App\Filament\Resources\FuelPrices\Pages;
use App\Models\FuelPrice;
use BackedEnum;
use UnitEnum;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class FuelPriceResource extends Resource
{
    protected static ?string $model = FuelPrice::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-fire';
    protected static string|UnitEnum|null $navigationGroup = 'Financials';
    protected static ?string $navigationLabel = 'Fuel Price Index';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\TextInput::make('region')
                    ->required()
                    ->default('Lagos'),
                Forms\Components\Select::make('fuel_type')
                    ->options([
                        'PMS' => 'PMS (Petrol)',
                        'AGO' => 'AGO (Diesel)',
                        'CNG' => 'CNG (Compressed Natural Gas)',
                    ])
                    ->required()
                    ->default('PMS'),
                Forms\Components\TextInput::make('price_per_liter')
                    ->label('Price per Liter (₦)')
                    ->required()
                    ->numeric()
                    ->default(950.00),
                Forms\Components\DateTimePicker::make('effective_at')
                    ->default(now()),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('region')->searchable(),
                Tables\Columns\TextColumn::make('fuel_type')->badge(),
                Tables\Columns\TextColumn::make('price_per_liter')->money('NGN')->sortable(),
                Tables\Columns\TextColumn::make('effective_at')->dateTime()->sortable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFuelPrices::route('/'),
        ];
    }
}
