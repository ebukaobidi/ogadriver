<?php

namespace App\Filament\Resources\VehicleCosts;

use App\Filament\Resources\VehicleCosts\Pages;
use App\Models\VehicleCost;
use BackedEnum;
use UnitEnum;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class VehicleCostResource extends Resource
{
    protected static ?string $model = VehicleCost::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-truck';
    protected static string|UnitEnum|null $navigationGroup = 'Financials';
    protected static ?string $navigationLabel = 'Vehicle Cost Matrices';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\Select::make('vehicle_type')
                    ->options([
                        'saloon' => 'Saloon Car',
                        'suv' => 'SUV / 4x4',
                        'van' => 'Minivan / Bus',
                        'truck' => 'Heavy Duty Truck / Tanker',
                        'motorcycle' => 'Motorcycle / Bike',
                    ])
                    ->required()
                    ->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('fuel_consumption_per_km')
                    ->label('Fuel Consumption (Liters per Km)')
                    ->required()
                    ->numeric()
                    ->step(0.001)
                    ->default(0.100),
                Forms\Components\TextInput::make('maintenance_cost_per_km')
                    ->label('Maintenance Cost per Km (₦)')
                    ->required()
                    ->numeric()
                    ->default(25.00),
                Forms\Components\TextInput::make('depreciation_cost_per_km')
                    ->label('Depreciation Cost per Km (₦)')
                    ->required()
                    ->numeric()
                    ->default(15.00),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('vehicle_type')->badge()->searchable(),
                Tables\Columns\TextColumn::make('fuel_consumption_per_km')->label('Liters/Km')->sortable(),
                Tables\Columns\TextColumn::make('maintenance_cost_per_km')->label('Maint/Km')->money('NGN')->sortable(),
                Tables\Columns\TextColumn::make('depreciation_cost_per_km')->label('Deprec/Km')->money('NGN')->sortable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVehicleCosts::route('/'),
        ];
    }
}
