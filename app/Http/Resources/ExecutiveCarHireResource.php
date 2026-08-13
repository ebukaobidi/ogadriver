<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExecutiveCarHireResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'state' => $this->state,
            'lga' => $this->lga,
            'address' => $this->address,
            'registration_number' => $this->registration_number,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'logo_url' => $this->logo_path,
            'fleet' => $this->fleet ?? [],
            'services' => $this->services ?? [],
            'is_active' => (bool) $this->is_active,
            'is_verified' => (bool) $this->is_verified,
            'images' => $this->images ?? [],
            'videos' => $this->videos ?? [],
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
