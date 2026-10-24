<?php

namespace App\Filament\Resources\ExecutiveCarHires;

use App\Filament\Resources\ExecutiveCarHires\Pages\ListExecutiveCarHires;
use App\Models\ExecutiveCarHire;
use BackedEnum;
use UnitEnum;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class ExecutiveCarHireResource extends Resource
{
    protected static ?string $model = ExecutiveCarHire::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-briefcase';
    protected static string|UnitEnum|null $navigationGroup = 'Operations';
    protected static ?string $navigationLabel = 'Hire Market Fleets';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->placeholder('e.g. Executive Lagos Chauffeur Fleet'),
                Forms\Components\TextInput::make('state')
                    ->required()
                    ->placeholder('Lagos, Abuja, Rivers...'),
                Forms\Components\TextInput::make('lga')
                    ->required()
                    ->placeholder('LGA / District'),
                Forms\Components\TextInput::make('address')
                    ->nullable(),
                Forms\Components\TextInput::make('contact_phone')
                    ->nullable(),
                Forms\Components\TextInput::make('contact_email')
                    ->email()
                    ->nullable(),
                Forms\Components\Textarea::make('description')
                    ->nullable(),
                Forms\Components\Toggle::make('is_active')
                    ->default(true),
                Forms\Components\Toggle::make('is_verified')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('state')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('lga')
                    ->searchable(),
                Tables\Columns\TextColumn::make('contact_phone'),
                Tables\Columns\IconColumn::make('is_verified')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListExecutiveCarHires::route('/'),
        ];
    }
}
