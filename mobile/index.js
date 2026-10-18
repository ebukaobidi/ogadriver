import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';

const slug = Constants.expoConfig?.slug || '';
const name = (Constants.expoConfig?.name || '').toLowerCase();
const pkg = (Constants.expoConfig?.android?.package || '').toLowerCase();
const scheme = (Constants.expoConfig?.scheme || '').toLowerCase();
const variant = (process.env.EXPO_PUBLIC_APP_VARIANT || '').toLowerCase();

const isDriver = variant === 'driver' || 
                 variant === 'partner' || 
                 pkg.includes('partner') || 
                 scheme.includes('partner') || 
                 name.includes('partner');

const isHirer = variant === 'hirer' || 
                pkg.includes('hirer') || 
                scheme.includes('hirer') || 
                name.includes('hire') || 
                name.includes('rider');

const App = isDriver
  ? require('./AppDriver').default
  : require('./AppHirer').default;

registerRootComponent(App);
