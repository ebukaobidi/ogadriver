<?php

namespace App\Filament\Resources\Referrals;

use App\Filament\Resources\Referrals\Pages;
use App\Models\User;
use BackedEnum;
use UnitEnum;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ReferralResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-gift';
    protected static string|UnitEnum|null $navigationGroup = 'Financials';
    protected static ?string $navigationLabel = 'Referrals & Rewards';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['loyaltyPoint'])
            ->where(function (Builder $query) {
                $query->whereNotNull('referral_code')
                      ->orWhere('referral_balance', '>', 0)
                      ->orWhere('referral_pending_balance', '>', 0)
                      ->orWhere('referral_rewarded', '>', 0)
                      ->orHas('loyaltyPoint');
            });
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\TextInput::make('name')
                    ->disabled(),
                Forms\Components\TextInput::make('email')
                    ->disabled(),
                Forms\Components\TextInput::make('referral_code')
                    ->label('Referral Code'),
                Forms\Components\TextInput::make('referral_pending_balance')
                    ->label('Pending Referral Bonus (₦)')
                    ->numeric(),
                Forms\Components\TextInput::make('referral_balance')
                    ->label('Claimable Referral Balance (₦)')
                    ->numeric(),
                Forms\Components\TextInput::make('referral_rewarded')
                    ->label('Total Referral Earned (₦)')
                    ->numeric(),
                Forms\Components\TextInput::make('loyaltyPoint.points')
                    ->label('OgaPoints Balance')
                    ->helperText('Points convertible to ride discounts (capped to protect margins).')
                    ->numeric(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('referral_code')
                    ->label('Code')
                    ->badge()
                    ->searchable(),
                Tables\Columns\TextColumn::make('loyaltyPoint.points')
                    ->label('OgaPoints')
                    ->badge()
                    ->color('success')
                    ->sortable(),
                Tables\Columns\TextColumn::make('referral_pending_balance')
                    ->label('Pending')
                    ->money('NGN')
                    ->sortable(),
                Tables\Columns\TextColumn::make('referral_balance')
                    ->label('Claimable')
                    ->money('NGN')
                    ->sortable(),
                Tables\Columns\TextColumn::make('referral_rewarded')
                    ->label('Total Earned')
                    ->money('NGN')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Joined')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReferrals::route('/'),
        ];
    }
}
