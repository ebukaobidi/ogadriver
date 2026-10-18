// OgaDriver Pan-African Currency Manager
// Dynamically fetches and formats currency based on the user's country profile or IP.

const COUNTRY_CURRENCIES = {
    'NG': { symbol: '₦', code: 'NGN', name: 'Naira' },
    'GH': { symbol: 'GH₵', code: 'GHS', name: 'Cedi' },
    'KE': { symbol: 'KSh', code: 'KES', name: 'Shilling' },
    'ZA': { symbol: 'R', code: 'ZAR', name: 'Rand' },
    'US': { symbol: '$', code: 'USD', name: 'Dollar' }
};

export const getCurrencySymbol = (countryCode = 'NG') => {
    const code = (countryCode || 'NG').toUpperCase();
    return COUNTRY_CURRENCIES[code]?.symbol || '₦';
};

export const formatCurrency = (amount, countryCode = 'NG') => {
    const symbol = getCurrencySymbol(countryCode);
    const parsedAmount = parseFloat(amount) || 0;
    return symbol + parsedAmount.toLocaleString();
};
