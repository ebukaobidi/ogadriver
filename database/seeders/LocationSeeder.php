<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add Countries
        $countries = [
            ['name' => 'Nigeria', 'code' => 'NGA'],
            ['name' => 'South Africa', 'code' => 'ZAF'],
            ['name' => 'Kenya', 'code' => 'KEN'],
            ['name' => 'Ghana', 'code' => 'GHA'],
            ['name' => 'Egypt', 'code' => 'EGY'],
        ];

        foreach ($countries as $c) {
            \App\Models\Country::firstOrCreate(['name' => $c['name']], $c);
        }

        $nigeria = \App\Models\Country::where('name', 'Nigeria')->first();
        $southAfrica = \App\Models\Country::where('name', 'South Africa')->first();
        $kenya = \App\Models\Country::where('name', 'Kenya')->first();
        $ghana = \App\Models\Country::where('name', 'Ghana')->first();
        $egypt = \App\Models\Country::where('name', 'Egypt')->first();

        // Nigeria States & Cities
        $nigeriaStates = [
            'Lagos' => ['Ikeja', 'Surulere', 'Lekki', 'Victoria Island', 'Yaba', 'Oshodi', 'Badagry', 'Epe', 'Ikorodu'],
            'Abuja (FCT)' => ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Lugbe', 'Bwari'],
            'Rivers' => ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Bonny', 'Okrika', 'Oyigbo'],
            'Kano' => ['Kano Municipal', 'Dala', 'Gwale', 'Tarauni', 'Fagge', 'Nassarawa'],
            'Oyo' => ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin', 'Saki'],
            'Kaduna' => ['Kaduna North', 'Kaduna South', 'Zaria', 'Kafanchan', 'Saminaka'],
            'Enugu' => ['Enugu North', 'Enugu South', 'Nsukka', 'Awgu', 'Udi'],
            'Edo' => ['Benin City', 'Uromi', 'Ekpoma', 'Auchi', 'Igarra'],
            'Delta' => ['Asaba', 'Warri', 'Ughelli', 'Sapele', 'Agbor'],
            'Ogun' => ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Sango Ota', 'Ilaro'],
            'Anambra' => ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Ihiala'],
            'Imo' => ['Owerri', 'Orlu', 'Okigwe', 'Oguta', 'Mbaise'],
            'Abia' => ['Umuahia', 'Aba', 'Ohafia', 'Arochukwu'],
            'Akwa Ibom' => ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron', 'Abak'],
            'Cross River' => ['Calabar', 'Ikom', 'Ogoja', 'Ugep', 'Obudu'],
            'Plateau' => ['Jos', 'Pankshin', 'Shendam', 'Langtang', 'Barkin Ladi'],
            'Kwara' => ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba', 'Lafiagi'],
            'Osun' => ['Osogbo', 'Ife', 'Ilesa', 'Ede', 'Ikirun'],
            'Ondo' => ['Akure', 'Ondo', 'Owo', 'Ore', 'Ikare'],
            'Ekiti' => ['Ado Ekiti', 'Ikere', 'Ilawe', 'Oye', 'Ijero'],
            'Kogi' => ['Lokoja', 'Okene', 'Kabba', 'Idah', 'Anyigba'],
            'Benue' => ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Zaki-Biam'],
            'Nasarawa' => ['Lafia', 'Keffi', 'Akwanga', 'Karu', 'Nasarawa'],
            'Niger' => ['Minna', 'Bida', 'Suleja', 'Kontagora', 'New Bussa'],
            'Bauchi' => ['Bauchi', 'Azare', 'Misau', 'Jama\'are', 'Ningi'],
            'Borno' => ['Maiduguri', 'Jere', 'Bama', 'Biu', 'Gwoza'],
            'Katsina' => ['Katsina', 'Daura', 'Funtua', 'Dutsin-Ma'],
            'Sokoto' => ['Sokoto', 'Tambuwal', 'Bodinga', 'Gwadabawa', 'Isa'],
            'Zamfara' => ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Anka'],
            'Kebbi' => ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'],
            'Jigawa' => ['Dutse', 'Hadejia', 'Kazaure', 'Gumel', 'Ringim'],
            'Yobe' => ['Damaturu', 'Potiskum', 'Gashua', 'Nguru', 'Geidam'],
            'Taraba' => ['Jalingo', 'Wukari', 'Bali', 'Gembu', 'Zing'],
            'Adamawa' => ['Yola', 'Mubi', 'Numan', 'Ganye', 'Michika'],
            'Gombe' => ['Gombe', 'Kumo', 'Billiri', 'Bajoga', 'Duku'],
            'Ebonyi' => ['Abakaliki', 'Afikpo', 'Onueke', 'Ishielu'],
            'Bayelsa' => ['Yenagoa', 'Ogbia', 'Sagbama', 'Brass', 'Nembe'],
        ];

        foreach ($nigeriaStates as $stateName => $cities) {
            $state = \App\Models\State::firstOrCreate(['name' => $stateName, 'country_id' => $nigeria->id]);
            foreach ($cities as $city) {
                \App\Models\City::firstOrCreate(['name' => $city, 'state_id' => $state->id]);
            }
        }

        // South Africa
        $saStates = [
            'Gauteng' => ['Johannesburg', 'Pretoria', 'Centurion', 'Soweto'],
            'Western Cape' => ['Cape Town', 'Stellenbosch', 'Paarl'],
            'KwaZulu-Natal' => ['Durban', 'Pietermaritzburg', 'Richards Bay'],
        ];
        foreach ($saStates as $stateName => $cities) {
            $state = \App\Models\State::firstOrCreate(['name' => $stateName, 'country_id' => $southAfrica->id]);
            foreach ($cities as $city) {
                \App\Models\City::firstOrCreate(['name' => $city, 'state_id' => $state->id]);
            }
        }

        // Kenya
        $keStates = [
            'Nairobi' => ['Nairobi City', 'Westlands', 'Kasarani'],
            'Mombasa' => ['Mombasa City', 'Nyali', 'Likoni'],
            'Kiambu' => ['Thika', 'Kiambu Town', 'Ruiru'],
        ];
        foreach ($keStates as $stateName => $cities) {
            $state = \App\Models\State::firstOrCreate(['name' => $stateName, 'country_id' => $kenya->id]);
            foreach ($cities as $city) {
                \App\Models\City::firstOrCreate(['name' => $city, 'state_id' => $state->id]);
            }
        }

        // Ghana
        $ghStates = [
            'Greater Accra' => ['Accra', 'Tema', 'Madina'],
            'Ashanti' => ['Kumasi', 'Obuasi', 'Ejisu'],
        ];
        foreach ($ghStates as $stateName => $cities) {
            $state = \App\Models\State::firstOrCreate(['name' => $stateName, 'country_id' => $ghana->id]);
            foreach ($cities as $city) {
                \App\Models\City::firstOrCreate(['name' => $city, 'state_id' => $state->id]);
            }
        }

        // Egypt
        $egStates = [
            'Cairo' => ['Cairo', 'New Cairo', 'Maadi'],
            'Alexandria' => ['Alexandria', 'Borg El Arab'],
        ];
        foreach ($egStates as $stateName => $cities) {
            $state = \App\Models\State::firstOrCreate(['name' => $stateName, 'country_id' => $egypt->id]);
            foreach ($cities as $city) {
                \App\Models\City::firstOrCreate(['name' => $city, 'state_id' => $state->id]);
            }
        }
    }
}
