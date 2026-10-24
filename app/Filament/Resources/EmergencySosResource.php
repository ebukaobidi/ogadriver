<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EmergencySosResource\Pages;
use App\Models\EmergencySosAlert;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Schemas\Schema;
use BackedEnum;
use UnitEnum;

class EmergencySosResource extends Resource
{
    protected static ?string $model = EmergencySosAlert::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-shield-exclamation';
    protected static string|UnitEnum|null $navigationGroup = 'Safety & Security';
    protected static ?string $navigationLabel = 'SOS Panic Beacons';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Forms\Components\TextInput::make('latitude')
                    ->required(),
                Forms\Components\TextInput::make('longitude')
                    ->required(),
                Forms\Components\TextInput::make('address'),
                Forms\Components\Select::make('status')
                    ->options([
                        'active' => 'Active Danger',
                        'resolved' => 'Resolved',
                        'false_alarm' => 'False Alarm',
                    ])
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Driver Name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('address')
                    ->searchable(),
                Tables\Columns\TextColumn::make('latitude'),
                Tables\Columns\TextColumn::make('longitude'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'danger' => 'active',
                        'success' => 'resolved',
                        'secondary' => 'false_alarm',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEmergencySos::route('/'),
        ];
    }
}
