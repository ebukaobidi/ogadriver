import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';

const safeGetItem = async (key) => {
  try {
    if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    return null;
  }
};

const safeSetItem = async (key, val) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
      return;
    }
    await SecureStore.setItemAsync(key, val);
  } catch (e) {}
};

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'pidgin', label: 'Nigerian Pidgin', native: 'Naija Pidgin', flag: '🇳🇬' },
  { code: 'yo', label: 'Yorùbá', native: 'Èdè Yorùbá', flag: '🟢' },
  { code: 'ha', label: 'Hausa', native: 'Harshen Hausa', flag: '⚪' },
  { code: 'ig', label: 'Igbo', native: 'Asụsụ Igbo', flag: '🔴' },
  { code: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
];

export const MOBILE_TRANSLATIONS = {
  en: {
    home: 'Home',
    find_drivers: 'Find Drivers',
    hire_driver: 'Hire a Driver',
    book_ride: 'Book a Ride',
    wallet: 'Wallet',
    profile: 'Profile',
    where_to: 'Where to?',
    pickup_location: 'Pickup Location',
    destination: 'Destination',
    confirm_booking: 'Confirm Booking',
    go_online: 'Go Online',
    go_offline: 'Go Offline',
    available_jobs: 'Available Jobs',
    accept: 'Accept',
    decline: 'Decline',
    emergency_sos: 'Emergency SOS',
    return_to_english: 'Switch back to English',
    detected_location: 'Language set by your location',
  },
  pidgin: {
    home: 'Home',
    find_drivers: 'Find Driver',
    hire_driver: 'Hire Driver',
    book_ride: 'Book Ride',
    wallet: 'My Wallet',
    profile: 'My Profile',
    where_to: 'Where you dey go?',
    pickup_location: 'Where we go pick you?',
    destination: 'Where you dey drop?',
    confirm_booking: 'Confirm this Ride',
    go_online: 'Start Work (Online)',
    go_offline: 'Close Work (Offline)',
    available_jobs: 'Work Wey Dey Ground',
    accept: 'Carry Am',
    decline: 'Leave Am',
    emergency_sos: 'Kuku Help (SOS)',
    return_to_english: 'Change to English',
    detected_location: 'Naija Pidgin set by location',
  },
  ha: {
    home: 'Gida',
    find_drivers: 'Nemi Direba',
    hire_driver: 'Ɗauki Hayar Direba',
    book_ride: 'Odar Mota',
    wallet: 'Asusun Kuɗi',
    profile: 'Tsarina',
    where_to: 'Ina za ka?',
    pickup_location: 'Wurin Ɗauka',
    destination: 'Wurin Sauka',
    confirm_booking: 'Tabbatar da Odar',
    go_online: 'Shiga Aiki',
    go_offline: 'Fita Daga Aiki',
    available_jobs: 'Ayyukan da ke Akwai',
    accept: 'Karɓa',
    decline: 'Ƙi',
    emergency_sos: 'Gaggawa (SOS)',
    return_to_english: 'Koma Turanci (English)',
    detected_location: 'An saita Hausa bisa ga yankinka',
  },
  yo: {
    home: 'Ilé',
    find_drivers: 'Wá Awakọ̀',
    hire_driver: 'Gba Awakọ̀',
    book_ride: 'Bọ́ọ̀kì Ọkọ̀',
    wallet: 'Àpò Owó Mi',
    profile: 'Àkọọ́lẹ̀ Mi',
    where_to: 'Níbo lo ń lọ?',
    pickup_location: 'Ibi Ìbẹ̀rẹ̀',
    destination: 'Ibi Ìdúró',
    confirm_booking: 'Fidájú Bọ́ọ̀kì',
    go_online: 'Bẹ̀rẹ̀ Iṣẹ́',
    go_offline: 'Dúró Ní Iṣẹ́',
    available_jobs: 'Àwọn Iṣẹ́ Tí Ó Wà',
    accept: 'Gba',
    decline: 'Kọ̀',
    emergency_sos: 'Pàjáwìrì (SOS)',
    return_to_english: 'Padà sí Gẹ̀ẹ́sì (English)',
    detected_location: 'A yan Yorùbá látàrí agbègbè rẹ',
  },
  ig: {
    home: 'Ụlọ',
    find_drivers: 'Chọọ Onye Ọkwọ',
    hire_driver: 'Goro Onye Ọkwọ',
    book_ride: 'Banye Ụgbọala',
    wallet: 'Akpa Ego M',
    profile: 'Profaịlụ M',
    where_to: 'Ebee ka ị na-aga?',
    pickup_location: 'Ebe A Ga-esi Were Gị',
    destination: 'Ebe Ị Na-eje',
    confirm_booking: 'Kwenye Njem',
    go_online: 'Bido Ọrụ',
    go_offline: 'Kwụsị Ọrụ',
    available_jobs: 'Ọrụ Ndị Dị Ugbu A',
    accept: 'Nabata',
    decline: 'Jụ',
    emergency_sos: 'Ihe Mberede (SOS)',
    return_to_english: 'Laghachi Bekee (English)',
    detected_location: 'Ahọpụtara Igbo dabere n\'ebe ị nọ',
  },
  fr: {
    home: 'Accueil',
    find_drivers: 'Trouver un Chauffeur',
    hire_driver: 'Engager un Chauffeur',
    book_ride: 'Réserver un Trajet',
    wallet: 'Portefeuille',
    profile: 'Mon Profil',
    where_to: 'Où allez-vous ?',
    pickup_location: 'Lieu de départ',
    destination: 'Destination',
    confirm_booking: 'Confirmer la réservation',
    go_online: 'Passer en Ligne',
    go_offline: 'Se Déconnecter',
    available_jobs: 'Courses Disponibles',
    accept: 'Accepter',
    decline: 'Refuser',
    emergency_sos: 'Urgence SOS',
    return_to_english: 'Revenir à l\'Anglais',
    detected_location: 'Langue définie par localisation',
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  detectedAuto: false,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [detectedAuto, setDetectedAuto] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await safeGetItem('mobile_app_language');
      if (saved) {
        setLanguageState(saved);
        return;
      }

      // Auto-detect from GPS coordinates
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getLastKnownPositionAsync({});
          if (loc && loc.coords) {
            const { latitude, longitude } = loc.coords;
            let detected = 'en';

            if (latitude > 9.0 && latitude <= 14.0 && longitude >= 3.0 && longitude <= 14.5) {
              detected = 'ha'; // Northern Nigeria (Hausa)
            } else if (latitude >= 6.0 && latitude <= 8.5 && longitude >= 2.6 && longitude <= 5.5) {
              detected = 'yo'; // South-West Nigeria (Yoruba)
            } else if (latitude >= 4.8 && latitude <= 7.0 && longitude >= 6.5 && longitude <= 8.5) {
              detected = 'ig'; // South-East Nigeria (Igbo)
            } else if (latitude >= 4.3 && latitude <= 6.5 && longitude >= 5.0 && longitude <= 7.5) {
              detected = 'pidgin'; // Niger Delta / South-South (Pidgin)
            }

            if (detected !== 'en') {
              setLanguageState(detected);
              setDetectedAuto(true);
            }
          }
        }
      } catch (locErr) {
        // Location permission not yet granted or unavailable
      }
    } catch (e) {
      console.log('Error loading language:', e);
    }
  };

  const updateLanguage = async (code) => {
    setLanguageState(code);
    setDetectedAuto(false);
    await safeSetItem('mobile_app_language', code);
  };

  const t = (key) => {
    const dict = MOBILE_TRANSLATIONS[language] || MOBILE_TRANSLATIONS.en;
    return dict[key] || MOBILE_TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: updateLanguage,
        t,
        detectedAuto,
        supportedLanguages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
