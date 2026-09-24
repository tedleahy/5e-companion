# 5e Companion front end

An [Expo](https://expo.dev) app for web, Android and iOS, using Expo Router.

## Running it

```bash
npm install
cp .env.example .env
npx expo start
```

Then press `w` to open the web build, or scan the QR code with Expo Go on your phone. A phone can't reach `localhost` on your computer, so for Expo Go set `EXPO_PUBLIC_API_URL` in `.env` to your computer's LAN address.

## Checks

```bash
npm run lint
npm run typecheck
npm test
```
