import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'pidgin', label: 'Nigerian Pidgin', native: 'Naija Pidgin', flag: '🇳🇬' },
  { code: 'yo', label: 'Yorùbá', native: 'Èdè Yorùbá', flag: '🟢' },
  { code: 'ha', label: 'Hausa', native: 'Harshen Hausa', flag: '⚪' },
  { code: 'ig', label: 'Igbo', native: 'Asụsụ Igbo', flag: '🔴' },
  { code: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
];

export const TRANSLATIONS = {
  en: {
    // Navigation & Common
    home: 'Home',
    find_drivers: 'Find Drivers',
    hire_driver: 'Hire a Driver',
    book_ride: 'Book a Ride',
    executive_hire: 'Executive Car Hire',
    driving_schools: 'Driving Schools',
    pricing: 'Pricing',
    about_us: 'About Us',
    login: 'Login',
    sign_up: 'Sign Up',
    dashboard: 'Dashboard',
    profile: 'Profile',
    logout: 'Log Out',
    wallet: 'Wallet',
    support: 'Support',
    sos_emergency: 'Emergency SOS',
    search: 'Search',
    language: 'Language',
    return_to_english: 'Switch back to English',
    detected_location: 'Language set based on your location',

    // Hero & Tagline
    hero_title: 'Verified Professional Drivers on Demand',
    hero_subtitle: 'Hire vetted personal chauffeurs, interstate drivers, or book executive rides across Nigeria with biometric verification and live telemetry security.',
    get_started: 'Get Started',
    become_driver: 'Join as a Driver',
    explore_drivers: 'Explore Drivers',

    // Hirer / Ride Booking
    where_to: 'Where to?',
    pickup_location: 'Pickup Location',
    destination: 'Destination',
    select_vehicle: 'Select Vehicle Type',
    fare_estimate: 'Estimated Fare',
    confirm_booking: 'Confirm Booking',
    driver_arrived: 'Your driver has arrived',
    trip_in_progress: 'Trip in progress',
    trip_completed: 'Trip completed successfully',
    pay_with_paystack: 'Pay securely with Paystack',

    // Driver Operative
    go_online: 'Go Online',
    go_offline: 'Go Offline',
    you_are_online: 'You are Online — Ready for trips',
    you_are_offline: 'You are Offline',
    available_jobs: 'Available Trips & Contracts',
    accept_trip: 'Accept Trip',
    decline_trip: 'Decline',
    wallet_balance: 'Wallet Balance',
    withdraw_funds: 'Withdraw Funds',
    verification_status: 'Verification Status',
    verified: 'Verified Operative',

    // Security & Safety
    security_badge: 'NIN & Police Background Vetted',
    live_tracking: 'Live GPS Satellite Tracking',
    sos_alert: '24/7 Rapid Emergency Response',
  },

  pidgin: {
    // Navigation & Common
    home: 'Home',
    find_drivers: 'Find Driver',
    hire_driver: 'Hire Driver Sharp-Sharp',
    book_ride: 'Book Ride',
    executive_hire: 'Big Man Motors',
    driving_schools: 'Driving School dem',
    pricing: 'How Much E Cost',
    about_us: 'Who We Be',
    login: 'Log In',
    sign_up: 'Register Now',
    dashboard: 'Your Panel',
    profile: 'My Profile',
    logout: 'Comot App',
    wallet: 'My Wallet',
    support: 'Help Center',
    sos_emergency: 'Kuku Help! SOS',
    search: 'Find am',
    language: 'Language',
    return_to_english: 'Change back to English',
    detected_location: 'We set Naija Pidgin based on your location',

    // Hero & Tagline
    hero_title: 'Original Verified Drivers Wey Sure Die',
    hero_subtitle: 'Hire driver wey get sense, wey dem don check NIN and police clearance. Travel anywhere for Nigeria with full rest of mind.',
    get_started: 'Start Now',
    become_driver: 'Drive & Make Money',
    explore_drivers: 'Check Drivers',

    // Hirer / Ride Booking
    where_to: 'Where you dey go?',
    pickup_location: 'Where we go pick you?',
    destination: 'Where you dey drop?',
    select_vehicle: 'Choose the motor wey you like',
    fare_estimate: 'How much you go pay',
    confirm_booking: 'Confirm this Ride',
    driver_arrived: 'Your driver don reach where you dey!',
    trip_in_progress: 'Una dey on the road now',
    trip_completed: 'Una don land well-well!',
    pay_with_paystack: 'Pay safe-safe with Paystack',

    // Driver Operative
    go_online: 'Start Work (Go Online)',
    go_offline: 'Close Work (Go Offline)',
    you_are_online: 'You dey Online — Trips dey come',
    you_are_offline: 'You dey Offline',
    available_jobs: 'Work Wey Dey Ground',
    accept_trip: 'Carry this Trip',
    decline_trip: 'Leave am',
    wallet_balance: 'Money Inside Wallet',
    withdraw_funds: 'Transfer to My Bank',
    verification_status: 'Verification Level',
    verified: '100% Vetted Driver',

    // Security & Safety
    security_badge: 'NIN & Police Don Screen Am',
    live_tracking: 'Live Satellite Map Dey Follow You',
    sos_alert: '24/7 Security Team Standby',
  },

  ha: {
    // Navigation & Common
    home: 'Gida',
    find_drivers: 'Nemi Direbobi',
    hire_driver: 'Ɗauki Hayar Direba',
    book_ride: 'Yi Odar Mota',
    executive_hire: 'Motocin Alfarma',
    driving_schools: 'Makarantun Tuƙi',
    pricing: 'Farashi',
    about_us: 'Game da Mu',
    login: 'Shiga',
    sign_up: 'Yi Rajista',
    dashboard: 'Fannin Sarrafawa',
    profile: 'Tsarina',
    logout: 'Fita',
    wallet: 'Asusun Kuɗi',
    support: 'Tallafi',
    sos_emergency: 'Gaggawa (SOS)',
    search: 'Bincika',
    language: 'Yare',
    return_to_english: 'Koma zuwa Turanci (English)',
    detected_location: 'An saita Harshen Hausa bisa ga yankinka',

    // Hero & Tagline
    hero_title: 'Kwararrun Direbobi Masu Aminci a Shirye',
    hero_subtitle: 'Ɗauki hayar direba mai nagarta da aka tantance ta hanyar NIN da jami’an tsaro. Tafiya cikin kwanciyar hankali a duk faɗin Najeriya.',
    get_started: 'Fara Yanzu',
    become_driver: 'Zama Direba',
    explore_drivers: 'Duba Direbobi',

    // Hirer / Ride Booking
    where_to: 'Ina za ka?',
    pickup_location: 'Wurin Ɗauka',
    destination: 'Wurin Sauka',
    select_vehicle: 'Zaɓi Nau\'in Mota',
    fare_estimate: 'Kimanin Kuɗi',
    confirm_booking: 'Tabbatar da Odar',
    driver_arrived: 'Direbanka ya iso!',
    trip_in_progress: 'Ana kan tafiya yanzu',
    trip_completed: 'An kammala tafiya cikin nasara',
    pay_with_paystack: 'Biya da Paystack cikin aminci',

    // Driver Operative
    go_online: 'Shiga Aiki (Online)',
    go_offline: 'Fita Daga Aiki (Offline)',
    you_are_online: 'Kuna aiki — Ana jiran tafiya',
    you_are_offline: 'Ba kwa aiki yanzu',
    available_jobs: 'Ayyukan da ke akwai',
    accept_trip: 'Karɓi Tafiya',
    decline_trip: 'Ƙi Karɓa',
    wallet_balance: 'Kuɗin da ke Asusunku',
    withdraw_funds: 'Cire Kuɗi zuwa Banki',
    verification_status: 'Matsayin Tabbatarwa',
    verified: 'Tabbataccen Direba',

    // Security & Safety
    security_badge: 'An tantance da NIN da Jami\'an Tsaro',
    live_tracking: 'Binciken Tauraron Ɗan Adam na Kai Tsaye',
    sos_alert: 'Agajin Gaggawa na Sa\'o\'i 24',
  },

  yo: {
    // Navigation & Common
    home: 'Ilé',
    find_drivers: 'Wá Àwọn Awakọ̀',
    hire_driver: 'Gba Awakọ̀ Síṣẹ́',
    book_ride: 'Bọ́ọ̀kì Ọkọ̀',
    executive_hire: 'Àwọn Ọkọ̀ Ayọ́kẹ́lẹ́ Olówó',
    driving_schools: 'Ilé-ẹ̀kọ́ Ìwakọ̀',
    pricing: 'Iye Owó',
    about_us: 'Nípa Wa',
    login: 'Wọlé',
    sign_up: 'Forúkọsílẹ̀',
    dashboard: 'Pẹpẹ Ìṣàkóso',
    profile: 'Àkọọ́lẹ̀ Mi',
    logout: 'Jáde',
    wallet: 'Àpò Owó Mi',
    support: 'Ìrànwọ́',
    sos_emergency: 'Pàjáwìrì (SOS)',
    search: 'Wá Kiri',
    language: 'Èdè',
    return_to_english: 'Padà sí Èdè Gẹ̀ẹ́sì (English)',
    detected_location: 'A yan Èdè Yorùbá látàrí agbègbè rẹ',

    // Hero & Tagline
    hero_title: 'Àwọn Awakọ̀ Ọlọ́gbọ́n Tí A Ti Ṣàyẹ̀wò Wọ́n Dájú',
    hero_subtitle: 'Gba awakọ̀ tí a ti fọwọ́sí pẹ̀lú NIN àti àyẹ̀wò ọlọ́pàá síṣẹ́. Rìn ìrìn-àjò rẹ pẹ̀lú àlàáfíà ní gbogbo orílẹ̀-èdè Nàìjíríà.',
    get_started: 'Bẹ̀rẹ̀ Nísinsìnyí',
    become_driver: 'Di Awakọ̀ Pẹpẹ Wa',
    explore_drivers: 'Wo Àwọn Awakọ̀',

    // Hirer / Ride Booking
    where_to: 'Níbo lo ń lọ?',
    pickup_location: 'Ibi Ìbẹ̀rẹ̀ Ìrìn-àjò',
    destination: 'Ibi Ìdúró Ìkẹyìn',
    select_vehicle: 'Yan Irú Ọkọ̀',
    fare_estimate: 'Iye Owó Tí Yóò Náni',
    confirm_booking: 'Fidájú Bọ́ọ̀kì',
    driver_arrived: 'Awakọ̀ rẹ ti dé ibi tí o wà!',
    trip_in_progress: 'Ẹ wà lójú ọ̀nà lọ́wọ́lọ́wọ́',
    trip_completed: 'Ẹ ti dé ibi tí ẹ̀ ń lọ láyọ̀',
    pay_with_paystack: 'San owó pẹ̀lú Paystack láìsí ewu',

    // Driver Operative
    go_online: 'Bẹ̀rẹ̀ Iṣẹ́ (Online)',
    go_offline: 'Dúró Ní Iṣẹ́ (Offline)',
    you_are_online: 'O wà lórí iṣẹ́ — Ó ṣeéṣe kí o rí èrò',
    you_are_offline: 'O kò sí lórí iṣẹ́ báyìí',
    available_jobs: 'Àwọn Iṣẹ́ Tí Ó Wà',
    accept_trip: 'Gba Ìrìn-àjò Yìí',
    decline_trip: 'Kọ̀ Ọ́',
    wallet_balance: 'Owó Tí Ó Wà Nínú Àpò Rẹ',
    withdraw_funds: 'Gbe Owó Lọ Sí Ilé Ìfowópamọ́',
    verification_status: 'Ìpele Ìfọwọ́sí',
    verified: 'Awakọ̀ Tí A Ti Fọwọ́sí Dájú',

    // Security & Safety
    security_badge: 'A ti ṣàyẹ̀wò NIN àti Àwọn Ọlọ́pàá',
    live_tracking: 'Àtòjọ Ìwọ̀n Ọkọ̀ Láyé Lóde Nípasẹ̀ Satelaiti',
    sos_alert: 'Ìrànlọ́wọ́ Pàjáwìrì Wákàtí 24/7',
  },

  ig: {
    // Navigation & Common
    home: 'Ụlọ',
    find_drivers: 'Chọọ Ndị Ọkwọ Ụgbọala',
    hire_driver: 'Goro Onye Ọkwọ Ụgbọala',
    book_ride: 'Banye Ụgbọala',
    executive_hire: 'Ụgbọala Ndị Eze',
    driving_schools: 'Ụlọ Akwụkwọ Ịkwọ Ụgbọala',
    pricing: 'Ọnụ Ahịa',
    about_us: 'Gbasara Anyị',
    login: 'Banye',
    sign_up: 'Debanye Aha',
    dashboard: 'Ebe Nchịkwa',
    profile: 'Profaịlụ M',
    logout: 'Pụọ',
    wallet: 'Akpa Ego M',
    support: 'Enyemaka',
    sos_emergency: 'Ihe Mberede (SOS)',
    search: 'Chọọ',
    language: 'Asụsụ',
    return_to_english: 'Laghachi na Bekee (English)',
    detected_location: 'Ahọpụtara Asụsụ Igbo dabere n\'ebe ị nọ',

    // Hero & Tagline
    hero_title: 'Ndị Ọkwọ Ụgbọala Amanyere nke Ọma',
    hero_subtitle: 'Goro ndị ọkwọ ụgbọala a nwalere nke ọma site na NIN na ndị uwe ojii. Mee njem gị n\'udo na nchekwa n\'ofe Naịjirịa niile.',
    get_started: 'Bido Ugbu A',
    become_driver: 'Bụrụ Onye Ọkwọ Ụgbọala',
    explore_drivers: 'Lee Ndị Ọkwọ Ụgbọala',

    // Hirer / Ride Booking
    where_to: 'Ebee ka ị na-aga?',
    pickup_location: 'Ebe A Ga-esi Were Gị',
    destination: 'Ebe Ị Na-eje',
    select_vehicle: 'Họrọ Ụdị Ụgbọala',
    fare_estimate: 'Ego Ọ Ga-eri',
    confirm_booking: 'Kwenye Njem',
    driver_arrived: 'Onye ọkwọ ụgbọala gị abịala!',
    trip_in_progress: 'Njem na-aga n\'ihu',
    trip_completed: 'E mezuru njem nke ọma',
    pay_with_paystack: 'Kwụọ ụgwọ n\'udo site na Paystack',

    // Driver Operative
    go_online: 'Bido Ọrụ (Online)',
    go_offline: 'Kwụsị Ọrụ (Offline)',
    you_are_online: 'Ị nọ n\'ọrụ — Njem nwere ike ịbata',
    you_are_offline: 'Ị nọghị n\'ọrụ ugbu a',
    available_jobs: 'Ọrụ Ndị Dị Ugbu A',
    accept_trip: 'Nabata Njem',
    decline_trip: 'Jụ Njem',
    wallet_balance: 'Ego Dị n\'Akpa Gị',
    withdraw_funds: 'Kupụ Ego gaa Bank',
    verification_status: 'Ọkwa Nkwenye',
    verified: 'Onye Ọkwọ Ụgbọala E Kwadoro',

    // Security & Safety
    security_badge: 'E ji NIN na Ndị Uwe Ojii Nyochaa',
    live_tracking: 'Nleba Anya Satịlaịtị N\'Oge Na-aga',
    sos_alert: 'Enyemaka Mberede Awa 24/7',
  },

  fr: {
    // Navigation & Common
    home: 'Accueil',
    find_drivers: 'Trouver un Chauffeur',
    hire_driver: 'Engager un Chauffeur',
    book_ride: 'Réserver un Trajet',
    executive_hire: 'Location VIP & Berlines',
    driving_schools: 'Auto-écoles',
    pricing: 'Tarifs',
    about_us: 'À propos',
    login: 'Connexion',
    sign_up: 'Inscription',
    dashboard: 'Tableau de bord',
    profile: 'Mon Profil',
    logout: 'Déconnexion',
    wallet: 'Portefeuille',
    support: 'Support Client',
    sos_emergency: 'Urgence SOS',
    search: 'Rechercher',
    language: 'Langue',
    return_to_english: 'Revenir à l\'Anglais',
    detected_location: 'Langue définie selon votre localisation',

    // Hero & Tagline
    hero_title: 'Chauffeurs Professionnels Vérifiés sur Demande',
    hero_subtitle: 'Engagez des chauffeurs privés certifiés avec vérification d\'identité biométrique et suivi GPS par satellite en direct.',
    get_started: 'Commencer',
    become_driver: 'Devenir Chauffeur',
    explore_drivers: 'Voir les Chauffeurs',

    // Hirer / Ride Booking
    where_to: 'Où allez-vous ?',
    pickup_location: 'Lieu de prise en charge',
    destination: 'Destination',
    select_vehicle: 'Sélectionnez le véhicule',
    fare_estimate: 'Estimation du tarif',
    confirm_booking: 'Confirmer la réservation',
    driver_arrived: 'Votre chauffeur est arrivé !',
    trip_in_progress: 'Course en cours...',
    trip_completed: 'Course terminée avec succès',
    pay_with_paystack: 'Paiement sécurisé via Paystack',

    // Driver Operative
    go_online: 'Passer en Ligne',
    go_offline: 'Se Déconnecter',
    you_are_online: 'Vous êtes en ligne — Prêt pour les courses',
    you_are_offline: 'Vous êtes hors ligne',
    available_jobs: 'Courses Disponibles',
    accept_trip: 'Accepter la Course',
    decline_trip: 'Refuser',
    wallet_balance: 'Solde du Portefeuille',
    withdraw_funds: 'Retrait vers la Banque',
    verification_status: 'Statut de Vérification',
    verified: 'Chauffeur Agréé',

    // Security & Safety
    security_badge: 'Vérification Policière & Identité Nationale',
    live_tracking: 'Suivi par Satellite en Temps Réel',
    sos_alert: 'Intervention d\'Urgence 24h/24',
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  detectedAuto: false,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });
  const [detectedAuto, setDetectedAuto] = useState(false);

  useEffect(() => {
    // Only attempt auto-detection if user has not explicitly set a language yet
    const savedLang = localStorage.getItem('app_lang');
    if (!savedLang) {
      detectLanguageFromLocation();
    }
  }, []);

  const detectLanguageFromLocation = () => {
    // Try Geolocation if available
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          let detected = 'en';

          // Nigeria coordinate boundaries (~4°N to 14°N, 2.6°E to 14.6°E)
          // Northern Nigeria: Lat > 9.0 -> Hausa
          if (latitude > 9.0 && latitude <= 14.0 && longitude >= 3.0 && longitude <= 14.5) {
            detected = 'ha';
          }
          // South-West Nigeria (Lagos, Ogun, Oyo, etc.): Lat 6.2 - 8.5, Lng 2.6 - 5.5 -> Yoruba or Pidgin
          else if (latitude >= 6.0 && latitude <= 8.5 && longitude >= 2.6 && longitude <= 5.5) {
            detected = 'yo';
          }
          // South-East Nigeria (Enugu, Anambra, Imo, Abia): Lat 4.8 - 7.0, Lng 6.5 - 8.5 -> Igbo
          else if (latitude >= 4.8 && latitude <= 7.0 && longitude >= 6.5 && longitude <= 8.5) {
            detected = 'ig';
          }
          // Niger Delta / South-South (Port Harcourt, Delta, Edo): Lat 4.3 - 6.5, Lng 5.0 - 7.5 -> Pidgin
          else if (latitude >= 4.3 && latitude <= 6.5 && longitude >= 5.0 && longitude <= 7.5) {
            detected = 'pidgin';
          }

          if (detected !== 'en') {
            setLanguageState(detected);
            setDetectedAuto(true);
          }
        },
        () => {
          // Geolocation declined/unavailable: check browser timezone / language
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          if (timeZone.includes('Lagos') || timeZone.includes('Africa/Lagos')) {
            // In Nigeria: keep default en but flag available
          }
        },
        { timeout: 5000, maximumAge: 3600000 }
      );
    }
  };

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    setDetectedAuto(false);
    localStorage.setItem('app_lang', langCode);
    window.dispatchEvent(new CustomEvent('language_changed', { detail: langCode }));
  };

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, detectedAuto }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
