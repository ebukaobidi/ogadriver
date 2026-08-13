<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DrivingSchoolResource extends JsonResource
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
            'accreditation_number' => $this->accreditation_number,
            'accreditation_body' => $this->accreditation_body,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'logo_url' => $this->logo_path,
            'is_active' => $this->is_active,
            'is_verified' => (bool) $this->is_verified,
            'facilities' => $this->facilities ?? [],
            'images' => $this->images ?? [],
            'videos' => $this->videos ?? [],
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
?>
