import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

export const SUPPORTED_COUNTRIES = [
  {
    id: 'nigeria',
    code: 'NG',
    dialCode: '+234',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    symbol: '₦',
    marketTitle: 'Nigeria Operations',
    proverb: 'Oga driver no dey carry last',
  },
  {
    id: 'ghana',
    code: 'GH',
    dialCode: '+233',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    symbol: 'GH₵',
    marketTitle: 'Ghana Operations',
    proverb: 'Akwaaba! Safe travels with verified chauffeurs',
  },
  {
    id: 'kenya',
    code: 'KE',
    dialCode: '+254',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    symbol: 'KSh',
    marketTitle: 'Kenya Operations',
    proverb: 'Karibu! Executive ride and car hire in East Africa',
  },
  {
    id: 'south_africa',
    code: 'ZA',
    dialCode: '+27',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    symbol: 'R',
    marketTitle: 'South Africa Operations',
    proverb: 'Sawubona! Premium chauffeured mobility',
  },
  {
    id: 'united_kingdom',
    code: 'GB',
    dialCode: '+44',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    marketTitle: 'UK Operations',
    proverb: 'London & UK Executive Chauffeur Services',
  },
  {
    id: 'united_states',
    code: 'US',
    dialCode: '+1',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    marketTitle: 'US Operations',
    proverb: 'Premium interstate executive chauffeur',
  },
];

export const COUNTRY_BANKS = {
  nigeria: [
    { code: '058', name: 'Guaranty Trust Bank (GTBank)', type: 'commercial' },
    { code: '044', name: 'Access Bank', type: 'commercial' },
    { code: '057', name: 'Zenith Bank', type: 'commercial' },
    { code: '033', name: 'United Bank For Africa (UBA)', type: 'commercial' },
    { code: '011', name: 'First Bank of Nigeria', type: 'commercial' },
    { code: '50515', name: 'Moniepoint Microfinance Bank', type: 'fintech' },
    { code: '999991', name: 'OPay Digital Services', type: 'fintech' },
    { code: '999992', name: 'PalmPay Limited', type: 'fintech' },
    { code: '50211', name: 'Kuda Microfinance Bank', type: 'fintech' },
    { code: '035', name: 'Wema Bank / ALAT', type: 'commercial' },
    { code: '221', name: 'Stanbic IBTC Bank', type: 'commercial' },
    { code: '070', name: 'Fidelity Bank', type: 'commercial' },
    { code: '214', name: 'First City Monument Bank (FCMB)', type: 'commercial' },
    { code: '232', name: 'Sterling Bank', type: 'commercial' },
    { code: '032', name: 'Union Bank of Nigeria', type: 'commercial' },
    { code: '076', name: 'Polaris Bank', type: 'commercial' },
    { code: '101', name: 'Providus Bank', type: 'commercial' },
    { code: '050', name: 'Ecobank Nigeria', type: 'commercial' },
    { code: '301', name: 'Jaiz Bank', type: 'commercial' },
    { code: '302', name: 'Taj Bank', type: 'commercial' },
    { code: '566', name: 'VFD Microfinance Bank', type: 'fintech' },
    { code: '51318', name: 'FairMoney Microfinance Bank', type: 'fintech' },
    { code: '215', name: 'Unity Bank', type: 'commercial' },
    { code: '023', name: 'Citibank Nigeria', type: 'commercial' },
    { code: '068', name: 'Standard Chartered Bank', type: 'commercial' },
  ],
  ghana: [
    { code: 'MTN', name: 'MTN Mobile Money (MoMo)', type: 'mobile_money' },
    { code: 'VOD', name: 'Vodafone Cash (Telecel Cash)', type: 'mobile_money' },
    { code: 'ATL', name: 'AirtelTigo Money', type: 'mobile_money' },
    { code: 'GH040100', name: 'GCB Bank Limited', type: 'commercial' },
    { code: 'GH280100', name: 'Ecobank Ghana', type: 'commercial' },
    { code: 'GH030100', name: 'Absa Bank Ghana', type: 'commercial' },
    { code: 'GH190100', name: 'Stanbic Bank Ghana', type: 'commercial' },
    { code: 'GH140100', name: 'CalBank', type: 'commercial' },
    { code: 'GH240100', name: 'Fidelity Bank Ghana', type: 'commercial' },
    { code: 'GH120100', name: 'Zenith Bank Ghana', type: 'commercial' },
    { code: 'GH020100', name: 'Standard Chartered Ghana', type: 'commercial' },
  ],
  kenya: [
    { code: 'MPESA', name: 'M-Pesa Safaricom', type: 'mobile_money' },
    { code: 'AIRTEL', name: 'Airtel Money Kenya', type: 'mobile_money' },
    { code: 'KE68', name: 'Equity Bank Kenya', type: 'commercial' },
    { code: 'KE01', name: 'KCB Bank Kenya', type: 'commercial' },
    { code: 'KE11', name: 'Co-operative Bank of Kenya', type: 'commercial' },
    { code: 'KE03', name: 'Absa Bank Kenya', type: 'commercial' },
    { code: 'KE31', name: 'Stanbic Bank Kenya', type: 'commercial' },
    { code: 'KE07', name: 'NCBA Bank Kenya', type: 'commercial' },
    { code: 'KE02', name: 'Standard Chartered Kenya', type: 'commercial' },
    { code: 'KE63', name: 'Diamond Trust Bank (DTB)', type: 'commercial' },
  ],
  south_africa: [
    { code: 'ZA470010', name: 'Capitec Bank', type: 'commercial' },
    { code: 'ZA250655', name: 'First National Bank (FNB)', type: 'commercial' },
    { code: 'ZA051001', name: 'Standard Bank South Africa', type: 'commercial' },
    { code: 'ZA632005', name: 'Absa Bank South Africa', type: 'commercial' },
    { code: 'ZA198765', name: 'Nedbank', type: 'commercial' },
    { code: 'ZA678910', name: 'TymeBank', type: 'fintech' },
    { code: 'ZA580105', name: 'Investec Bank', type: 'commercial' },
    { code: 'ZA679000', name: 'Discovery Bank', type: 'fintech' },
    { code: 'ZA430000', name: 'African Bank', type: 'commercial' },
  ],
  united_kingdom: [
    { code: 'BARC', name: 'Barclays Bank UK', type: 'commercial' },
    { code: 'HSBC', name: 'HSBC UK', type: 'commercial' },
    { code: 'LOYD', name: 'Lloyds Bank', type: 'commercial' },
    { code: 'NWST', name: 'NatWest', type: 'commercial' },
    { code: 'MONZ', name: 'Monzo Bank', type: 'fintech' },
    { code: 'STRL', name: 'Starling Bank', type: 'fintech' },
    { code: 'REVO', name: 'Revolut UK', type: 'fintech' },
  ],
  united_states: [
    { code: 'CHAS', name: 'JPMorgan Chase', type: 'commercial' },
    { code: 'BOFA', name: 'Bank of America', type: 'commercial' },
    { code: 'WF', name: 'Wells Fargo', type: 'commercial' },
    { code: 'CITI', name: 'Citibank NA', type: 'commercial' },
    { code: 'CAP1', name: 'Capital One', type: 'commercial' },
    { code: 'CHIME', name: 'Chime Financial', type: 'fintech' },
  ]
};

const CountryContext = createContext({
  country: SUPPORTED_COUNTRIES[0],
  setCountry: () => {},
  updateCountry: () => {},
  supportedCountries: SUPPORTED_COUNTRIES,
  getBanksForCountry: () => [],
  formatAmount: () => '',
});

export const CountryProvider = ({ children }) => {
  const [country, setCountryState] = useState(SUPPORTED_COUNTRIES[0]);

  useEffect(() => {
    loadSavedCountry();
  }, []);

  const loadSavedCountry = async () => {
    try {
      const saved = await safeGetItem('global_selected_country') 
        || await safeGetItem('client_country_settings')
        || await safeGetItem('driver_operating_country');
      
      if (saved) {
        let parsed = null;
        try {
          parsed = JSON.parse(saved);
        } catch (e) {
          // In case raw code or string was stored
          parsed = SUPPORTED_COUNTRIES.find(
            (c) => c.code.toLowerCase() === saved.toLowerCase() || c.id.toLowerCase() === saved.toLowerCase()
          );
        }

        if (parsed) {
          const matched = SUPPORTED_COUNTRIES.find(
            (c) => c.code.toLowerCase() === (parsed.code || parsed.id || '').toLowerCase()
              || c.id.toLowerCase() === (parsed.id || parsed.code || '').toLowerCase()
          );
          if (matched) {
            setCountryState(matched);
          }
        }
      }
    } catch (e) {
      console.log('Error loading saved country:', e);
    }
  };

  const updateCountry = async (inputCountry) => {
    if (!inputCountry) return;

    let matched = null;
    if (typeof inputCountry === 'string') {
      matched = SUPPORTED_COUNTRIES.find(
        (c) => c.code.toLowerCase() === inputCountry.toLowerCase() 
          || c.id.toLowerCase() === inputCountry.toLowerCase()
          || c.name.toLowerCase() === inputCountry.toLowerCase()
      );
    } else if (typeof inputCountry === 'object') {
      matched = SUPPORTED_COUNTRIES.find(
        (c) => c.code.toLowerCase() === (inputCountry.code || '').toLowerCase()
          || c.id.toLowerCase() === (inputCountry.id || '').toLowerCase()
          || c.name.toLowerCase() === (inputCountry.name || '').toLowerCase()
      );
    }

    const finalCountry = matched || SUPPORTED_COUNTRIES[0];
    setCountryState(finalCountry);

    const serialized = JSON.stringify(finalCountry);
    await Promise.all([
      safeSetItem('global_selected_country', serialized),
      safeSetItem('client_country_settings', serialized),
      safeSetItem('driver_operating_country', serialized),
    ]);
  };

  const getBanksForCountry = (countryIdentifier) => {
    const target = countryIdentifier 
      ? (typeof countryIdentifier === 'string' ? countryIdentifier.toLowerCase() : (countryIdentifier.id || countryIdentifier.code || '').toLowerCase())
      : country.id;

    if (COUNTRY_BANKS[target]) return COUNTRY_BANKS[target];
    // Map codes like NG, GH, KE, ZA
    if (target === 'ng' || target === 'nigeria') return COUNTRY_BANKS.nigeria;
    if (target === 'gh' || target === 'ghana') return COUNTRY_BANKS.ghana;
    if (target === 'ke' || target === 'kenya') return COUNTRY_BANKS.kenya;
    if (target === 'za' || target === 'south_africa') return COUNTRY_BANKS.south_africa;
    if (target === 'gb' || target === 'united_kingdom') return COUNTRY_BANKS.united_kingdom;
    if (target === 'us' || target === 'united_states') return COUNTRY_BANKS.united_states;
    return COUNTRY_BANKS.nigeria;
  };

  const formatAmount = (num) => {
    const val = Number(num) || 0;
    return `${country.symbol}${val.toLocaleString()}`;
  };

  return (
    <CountryContext.Provider
      value={{
        country,
        setCountry: updateCountry,
        updateCountry,
        supportedCountries: SUPPORTED_COUNTRIES,
        getBanksForCountry,
        formatAmount,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => useContext(CountryContext);
export default CountryContext;
