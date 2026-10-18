import { readFileSync } from 'node:fs';

const appConfigs = {
  hirer: './app.hirer.json',
  driver: './app.driver.json',
};

export default ({ config }) => {
  const variant = process.env.EXPO_PUBLIC_APP_VARIANT;
  let baseConfig = config;

  if (variant) {
    const configPath = appConfigs[variant];
    if (!configPath) {
      throw new Error(`Unsupported EXPO_PUBLIC_APP_VARIANT: ${variant}`);
    }

    const selected = JSON.parse(readFileSync(new URL(configPath, import.meta.url), 'utf8')).expo;

    baseConfig = {
      ...selected,
      extra: {
        ...config.extra,
        ...selected.extra,
        eas: {
          ...config.extra?.eas,
          ...selected.extra?.eas,
        },
      },
    };
  }

  // Inject Google Maps API key dynamically from environment if set
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (mapsApiKey && baseConfig.android?.config?.googleMaps) {
    baseConfig.android.config.googleMaps.apiKey = mapsApiKey;
  }

  return baseConfig;
};
