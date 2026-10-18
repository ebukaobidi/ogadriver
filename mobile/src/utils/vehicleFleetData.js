/**
 * Comprehensive Vehicle Fleet Dataset for Nigerian & African Market
 * Covers VIP Luxury, Executive, Armored Ballistic Spec, and Standard fleets.
 */

export const FLEET_TIERS = [
  { 
    id: 'luxury', 
    name: 'VIP Luxury Fleet', 
    icon: 'diamond', 
    badge: '🌟 VIP LUXURY',
    color: '#10b981',
    desc: 'Maybach, S-Class, G-Wagon, LX600, Land Cruiser 300, Range Rover, Escalade' 
  },
  { 
    id: 'executive', 
    name: 'Executive Fleet', 
    icon: 'briefcase', 
    badge: '👔 EXECUTIVE',
    color: '#10b981',
    desc: 'Camry, ES350, E-Class, 5-Series, Prado, Highlander, Palisade, Telluride' 
  },
  { 
    id: 'standard', 
    name: 'Standard Fleet', 
    icon: 'car-sport', 
    badge: '🚗 STANDARD',
    color: '#10b981',
    desc: 'Corolla, Civic, Elantra, Sentra, Cerato, City' 
  },
];

export const FLEET_TYPES_LIST = [
  { 
    id: 'luxury', 
    name: 'VIP Luxury Fleet', 
    icon: 'diamond', 
    badge: '🌟 VIP LUXURY',
    color: '#10b981',
    desc: 'Maybach, Mercedes S-Class, G-Wagon, Lexus LX600, Range Rover Autobiography, Land Cruiser 300, Cadillac Escalade',
    fareNote: 'Maximum fare multiplier • Diplomatic & VIP clients',
    isArmored: false
  },
  { 
    id: 'executive', 
    name: 'Executive Fleet', 
    icon: 'briefcase', 
    badge: '👔 EXECUTIVE',
    color: '#10b981',
    desc: 'Toyota Camry, Lexus ES350, Mercedes E-Class, BMW 5-Series, Land Cruiser Prado, Toyota Highlander, Hyundai Palisade',
    fareNote: 'High demand • Corporate executives & airport transfers',
    isArmored: false
  },
  { 
    id: 'standard', 
    name: 'Standard Fleet', 
    icon: 'car-sport', 
    badge: '🚗 STANDARD',
    color: '#10b981',
    desc: 'Toyota Corolla, Honda Civic, Hyundai Elantra, Nissan Sentra, Kia Cerato, Honda City',
    fareNote: 'Everyday city hailing & courier dispatches',
    isArmored: false
  },
  {
    id: 'armored_vip',
    name: 'Ballistic Armored VIP (B6 / B7)',
    icon: 'shield-checkmark',
    badge: '🛡️ ARMORED VIP',
    color: '#10b981',
    desc: 'Certified B6/B7 bulletproof armored protection for high-threat escort, executive security convoys & government dignitaries',
    fareNote: 'Premium security rate • Armed protocol dispatches',
    isArmored: true
  }
];

export const DRIVER_OPERATIONAL_MODES = [
  {
    id: 'with_car',
    title: 'Driver With Car (Owner / Operator Mode)',
    subtitle: 'Drive your registered personal or lease-to-own vehicle',
    icon: 'car-sport',
    description: 'Approved for on-demand street hailing dispatches, passenger rides & scheduled private hire contracts with your own car.',
    tags: ['⚡ On-Demand Hailing', '📅 Scheduled Hire', '⛽ Instant Fuel Loan'],
    hailingAllowed: true,
  },
  {
    id: 'no_car',
    title: 'Driver Without Car (Chauffeur Placement Mode)',
    subtitle: 'Drive client, executive family & corporate fleet vehicles',
    icon: 'briefcase',
    description: 'Guarantor-vetted professional chauffeur placed to drive corporate executive cars, VIP private family fleets & hired business vans.',
    tags: ['🏢 Corporate Jobs', '👔 Private Chauffeur', '🛡️ Fleet Placements'],
    hailingAllowed: false,
  },
];


export const VEHICLE_BRANDS = [
  'Mercedes-Benz',
  'Lexus',
  'Toyota',
  'Land Rover',
  'BMW',
  'Cadillac',
  'Rolls-Royce',
  'Bentley',
  'Audi',
  'Honda',
  'Hyundai',
  'Kia',
  'Ford',
  'Porsche'
];

export const MODELS_BY_BRAND = {
  'Mercedes-Benz': [
    { name: 'S-Class / Maybach (S580 / S560)', tier: 'luxury' },
    { name: 'G-Wagon (G63 AMG / G550)', tier: 'luxury' },
    { name: 'GLS-Class (GLS 580 / GLS 450)', tier: 'luxury' },
    { name: 'GLE Coupe / GLE 450 AMG', tier: 'luxury' },
    { name: 'E-Class (E300 / E350)', tier: 'executive' },
    { name: 'GLE 350 SUV', tier: 'executive' },
    { name: 'GLC 300 SUV', tier: 'executive' },
    { name: 'C-Class (C300 / C200)', tier: 'executive' },
    { name: 'V-Class / Metris VIP Lounge', tier: 'executive' },
  ],
  'Lexus': [
    { name: 'LX 600 / LX 570 VIP', tier: 'luxury' },
    { name: 'GX 550 / GX 460 Luxury', tier: 'luxury' },
    { name: 'LS 500 VIP Sedan', tier: 'luxury' },
    { name: 'ES 350 / ES 300h Executive', tier: 'executive' },
    { name: 'RX 350 / RX 450h F-Sport', tier: 'executive' },
    { name: 'NX 350 / NX 300', tier: 'executive' },
    { name: 'IS 350 / IS 300', tier: 'executive' },
  ],
  'Toyota': [
    { name: 'Land Cruiser 300 (VXR / GR-Sport)', tier: 'luxury' },
    { name: 'Land Cruiser 200 (V8 VX-R)', tier: 'luxury' },
    { name: 'Land Cruiser Prado (TXL / VXL)', tier: 'luxury' },
    { name: 'Alphard / Vellfire VIP Lounge', tier: 'luxury' },
    { name: 'Sequoia Capstone / Platinum', tier: 'luxury' },
    { name: 'Camry (XSE / XLE / Limited)', tier: 'executive' },
    { name: 'Avalon (Limited / Touring)', tier: 'executive' },
    { name: 'Highlander (Platinum / Limited)', tier: 'executive' },
    { name: 'Fortuner 4x4', tier: 'executive' },
    { name: 'Venza Limited', tier: 'executive' },
    { name: 'RAV4 Limited', tier: 'executive' },
    { name: 'Corolla (Standard City)', tier: 'standard' },
    { name: 'Yaris', tier: 'standard' },
  ],
  'Land Rover': [
    { name: 'Range Rover Autobiography LWB', tier: 'luxury' },
    { name: 'Range Rover Vogue / SV', tier: 'luxury' },
    { name: 'Range Rover Sport (Dynamic)', tier: 'luxury' },
    { name: 'Defender 110 / 130 X-Dynamic', tier: 'luxury' },
    { name: 'Range Rover Velar R-Dynamic', tier: 'luxury' },
    { name: 'Discovery HSE', tier: 'executive' },
  ],
  'BMW': [
    { name: '7-Series (760i / 740Li M-Sport)', tier: 'luxury' },
    { name: 'X7 (M60i / xDrive40i)', tier: 'luxury' },
    { name: 'X6 M-Sport Coupe', tier: 'luxury' },
    { name: '5-Series (540i / 530i Executive)', tier: 'executive' },
    { name: 'X5 xDrive40i', tier: 'executive' },
    { name: 'X3 xDrive30i', tier: 'executive' },
    { name: '3-Series (330i M-Sport)', tier: 'executive' },
  ],
  'Cadillac': [
    { name: 'Escalade ESV Sport Platinum', tier: 'luxury' },
    { name: 'Escalade Premium Luxury', tier: 'luxury' },
    { name: 'XT6 Luxury 7-Seater', tier: 'executive' },
  ],
  'Rolls-Royce': [
    { name: 'Phantom VIII Extended', tier: 'luxury' },
    { name: 'Ghost Series II', tier: 'luxury' },
    { name: 'Cullinan VIP SUV', tier: 'luxury' },
  ],
  'Bentley': [
    { name: 'Flying Spur W12 / V8', tier: 'luxury' },
    { name: 'Bentayga Extended Wheelbase', tier: 'luxury' },
    { name: 'Continental GT', tier: 'luxury' },
  ],
  'Porsche': [
    { name: 'Panamera 4S / GTS Executive', tier: 'luxury' },
    { name: 'Cayenne Turbo / Coupe', tier: 'luxury' },
    { name: 'Macan GTS', tier: 'luxury' },
  ],
  'Audi': [
    { name: 'A8 L Quattro (Flagship VIP)', tier: 'luxury' },
    { name: 'Q8 / RS Q8 S-Line', tier: 'luxury' },
    { name: 'A6 55 TFSI Executive', tier: 'executive' },
    { name: 'Q7 7-Seater Prestige', tier: 'executive' },
    { name: 'Q5 S-Line Quattro', tier: 'executive' },
    { name: 'A4 45 TFSI', tier: 'executive' },
  ],
  'Honda': [
    { name: 'Accord Touring 2.0T / EX-L', tier: 'executive' },
    { name: 'Pilot Elite 7-Seater SUV', tier: 'executive' },
    { name: 'CR-V Touring', tier: 'executive' },
    { name: 'Civic (Standard City)', tier: 'standard' },
    { name: 'City', tier: 'standard' },
  ],
  'Hyundai': [
    { name: 'Palisade Calligraphy VIP', tier: 'executive' },
    { name: 'Santa Fe Calligraphy', tier: 'executive' },
    { name: 'Sonata Limited / N-Line', tier: 'executive' },
    { name: 'Tucson Limited', tier: 'executive' },
    { name: 'Elantra (Standard City)', tier: 'standard' },
  ],
  'Kia': [
    { name: 'Telluride SX Prestige VIP', tier: 'executive' },
    { name: 'Carnival VIP Lounge 7-Seater', tier: 'executive' },
    { name: 'Sorento SX-Prestige', tier: 'executive' },
    { name: 'K5 GT-Line Executive', tier: 'executive' },
    { name: 'Sportage SX', tier: 'executive' },
    { name: 'Cerato / Forte (Standard)', tier: 'standard' },
  ],
  'Ford': [
    { name: 'Lincoln Navigator Black Label (VIP)', tier: 'luxury' },
    { name: 'Explorer Platinum 7-Seater', tier: 'executive' },
    { name: 'Expedition Max Limited', tier: 'executive' },
    { name: 'Edge Titanium', tier: 'executive' },
    { name: 'Fusion / Mondeo Titanium', tier: 'executive' },
  ],
};

export const POPULAR_BRANDS = [
  'Toyota',
  'Lexus',
  'Mercedes-Benz',
  'Land Rover',
  'BMW',
  'Honda',
  'Hyundai',
  'Kia',
];

export const POPULAR_COLORS = [
  'Jet Black',
  'Metallic Silver',
  'Pearl White',
  'Midnight Blue',
  'Charcoal Gray',
  'Champagne Gold',
  'Dark Wine / Burgundy'
];

export const COLOR_SWATCHES = [
  { name: 'Jet Black', hex: '#111827', textHex: '#ffffff' },
  { name: 'Pearl White', hex: '#f8fafc', border: '#cbd5e1', textHex: '#0f172a' },
  { name: 'Metallic Silver', hex: '#94a3b8', textHex: '#0f172a' },
  { name: 'Midnight Blue', hex: '#1e3a8a', textHex: '#ffffff' },
  { name: 'Charcoal Gray', hex: '#475569', textHex: '#ffffff' },
  { name: 'Champagne Gold', hex: '#d97706', textHex: '#ffffff' },
  { name: 'Dark Wine', hex: '#831843', textHex: '#ffffff' },
];

export const POPULAR_YEARS = [
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018'
];

/**
 * Intelligent fleet classification
 */
export function detectFleetTier(make = '', model = '', year = 2020, isArmored = false) {
  if (isArmored) return 'armored_vip';
  
  const m = String(make).toLowerCase();
  const mod = String(model).toLowerCase();
  const y = parseInt(year, 10) || 2020;

  // Standard city cars
  const standardModels = ['corolla', 'yaris', 'matrix', 'avensis', 'civic', 'city', 'fit', 'elantra', 'accent', 'cerato', 'rio', 'forte', 'sentra', 'almera', 'versa', 'sunny', 'golf', 'jetta', 'polo'];
  if (standardModels.some(sm => mod.includes(sm))) {
    return 'standard';
  }

  // VIP & Luxury models & brands
  const luxuryModels = [
    'maybach', 's-class', 's class', 's580', 's560', 's550', 's500', 's450', 
    'g-wagon', 'g wagon', 'g63', 'gls', 'gle coupe', 
    'lx600', 'lx570', 'gx550', 'gx460', 'ls500', 
    'land cruiser', 'landcruiser', 'prado', 'alphard', 'vellfire', 'sequoia', 
    'autobiography', 'vogue', 'defender', 'velar', 'range rover sport', 
    'escalade', 'navigator', 'denali', 'patrol', 'armada', 
    'phantom', 'ghost', 'cullinan', 'flying spur', 'bentayga', 'continental gt', 
    'panamera', 'cayenne', 'macan', 
    '7-series', '7 series', '760i', '740i', 'x7', 'x6', 
    'a8', 'q8', 'rs q8'
  ];
  if (luxuryModels.some(lm => mod.includes(lm))) {
    return 'luxury';
  }
  if (['rolls-royce', 'bentley', 'porsche'].some(lb => m.includes(lb))) {
    return 'luxury';
  }

  // Executive models
  const executiveModels = [
    'camry', 'avalon', 'highlander', 'fortuner', 'venza', 'crown', 'rav4',
    'es350', 'es300', 'rx350', 'rx450', 'nx350', 'nx300', 'is350',
    'e-class', 'e class', 'e300', 'e350', 'c-class', 'c class', 'c300', 'gle 350', 'gle350', 'glc', 'metris', 'v-class',
    '5-series', '5 series', '530i', '540i', '3-series', '3 series', '330i', 'x5', 'x3',
    'a6', 'a4', 'q7', 'q5',
    'accord', 'pilot', 'cr-v', 'crv',
    'palisade', 'santa fe', 'sonata', 'tucson',
    'telluride', 'sorento', 'k5', 'optima', 'carnival',
    'explorer', 'expedition', 'edge', 'cx-9', 'cx-90'
  ];
  if (executiveModels.some(em => mod.includes(em))) {
    return 'executive';
  }

  const premiumBrands = ['mercedes', 'benz', 'lexus', 'land rover', 'range rover', 'bmw', 'audi', 'cadillac', 'lincoln', 'jaguar'];
  if (premiumBrands.some(pb => m.includes(pb))) {
    return 'executive';
  }

  return 'standard';
}
