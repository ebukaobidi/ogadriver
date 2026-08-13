<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class ApiSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'category',
        'is_encrypted',
        'description',
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
    ];

    /**
     * Get the decrypted value
     */
    public function getDecryptedValueAttribute()
    {
        if ($this->is_encrypted && $this->value) {
            try {
                return Crypt::decryptString($this->value);
            } catch (\Exception $e) {
                return $this->value;
            }
        }
        return $this->value;
    }

    /**
     * Set the encrypted value
     */
    public function setEncryptedValueAttribute($value)
    {
        if ($this->is_encrypted && $value) {
            $this->attributes['value'] = Crypt::encryptString($value);
        } else {
            $this->attributes['value'] = $value;
        }
    }

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }
        return $setting->decrypted_value;
    }

    /**
     * Set a setting value by key
     */
    public static function setValue(string $key, $value, string $category = 'general', bool $encrypt = true, string $description = null)
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $encrypt ? Crypt::encryptString($value) : $value,
                'category' => $category,
                'is_encrypted' => $encrypt,
                'description' => $description,
            ]
        );
    }

    /**
     * Get all settings by category
     */
    public static function getByCategory(string $category)
    {
        return static::where('category', $category)->get()->mapWithKeys(function ($setting) {
            $value = $setting->decrypted_value;
            
            // Auto-decode JSON if applicable
            if ($value && (str_starts_with($value, '[') || str_starts_with($value, '{'))) {
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $value = $decoded;
                }
            }
            
            return [$setting->key => $value];
        });
    }
}
