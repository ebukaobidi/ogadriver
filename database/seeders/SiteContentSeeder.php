<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SiteContent;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $contents = [
            // Hero Section
            ['section_key' => 'hero', 'key_name' => 'title', 'value' => 'Verified Drivers <br/>that drive <br/><span class="text-brandMint">Your Security Forward!</span>', 'type' => 'html'],
            ['section_key' => 'hero', 'key_name' => 'subtitle', 'value' => 'Airtight FRSC licensing verification, NIMC biometric liveness checks, and guarantor indemnity bonds mapped natively at source.', 'type' => 'text'],
            
            // Stats
            ['section_key' => 'stats', 'key_name' => 'active_placements', 'value' => '12,402+', 'type' => 'text'],
            ['section_key' => 'stats', 'key_name' => 'happy_employers', 'value' => '5,000+', 'type' => 'text'],
            
            // About Section
            ['section_key' => 'about', 'key_name' => 'tagline', 'value' => 'LAGOS-BORN, PAN-AFRICAN SECURITY', 'type' => 'text'],
            ['section_key' => 'about', 'key_name' => 'title', 'value' => 'Securing Africa\'s <br/>logistics heartland <br/>from the <span class="text-brandMint">source.</span>', 'type' => 'html'],
            ['section_key' => 'about', 'key_name' => 'paragraph_1', 'value' => 'Ogadriver was founded in the tech corridors of <strong>Yaba, Lagos</strong> with a single urgent mandate: to resolve the critical trust and identity deficits in Nigeria’s commercial transport and corporate fleet industry. Traditional driver verification in West Africa is broken, relying on easily forged physical papers and unverified guarantees.', 'type' => 'html'],
            ['section_key' => 'about', 'key_name' => 'paragraph_2', 'value' => 'By deploying our proprietary identity matching pipelines directly connected to the <strong>National Identity Management Commission (NIMC)</strong> and the <strong>Federal Road Safety Corps (FRSC)</strong>, we build an impenetrable digital ledger. From corporate drivers navigating Victoria Island to long-haul haulage pilots traversing the Lagos-Ibadan Expressway, we ensure your vehicles and cargo are operated by high-trust, biometrically authenticated professionals.', 'type' => 'html'],
        ];

        foreach ($contents as $content) {
            SiteContent::updateOrCreate(
                ['section_key' => $content['section_key'], 'key_name' => $content['key_name']],
                $content
            );
        }
    }
}
