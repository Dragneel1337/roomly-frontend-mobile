const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_BASE_URL. Copy .env.example to .env and set the API URL, then restart Expo (npx expo start -c).",
  );
}

export const API_BASE_URL = apiBaseUrl;
