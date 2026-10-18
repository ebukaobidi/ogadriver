import './assets/tailwind.css';
import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';

const slug = Constants.expoConfig?.slug || '';
const name = (Constants.expoConfig?.name || '').toLowerCase();
const variant = (process.env.EXPO_PUBLIC_APP_VARIANT || '').toLowerCase();

// Check URL query parameters in web browser
let urlParam = '';
if (typeof window !== 'undefined' && window.location) {
  try {
    const search = new URLSearchParams(window.location.search);
    urlParam = (search.get('variant') || search.get('mode') || search.get('app') || '').toLowerCase();
    if (window.location.search.includes('driver') || window.location.search.includes('partner')) {
      urlParam = 'driver';
    }
  } catch (e) {}
}

const isHirer = variant === 'hirer' || urlParam === 'hirer' || slug === 'ogadriver-hirer';
const isDriver = variant === 'driver' || variant === 'partner' || urlParam === 'driver' || urlParam === 'partner' || slug === 'ogadriver-partner' || name.includes('partner');

const App = isHirer
  ? require('./AppHirer').default
  : isDriver
    ? require('./AppDriver').default
    : require('./AppDriver').default;

registerRootComponent(App);
