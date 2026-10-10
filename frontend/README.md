# 5e Companion front end

An [Expo](https://expo.dev) app for web, Android and iOS, using Expo Router.

## Running it

```bash
npm install
cp .env.example .env
npx expo start
```

Then press `w` to open the web build. The app reads the characters of the demo user that the backend seed creates, so seed the database and start Rails first (see `backend/README.md`).

`.env` sets where the API is and the development bearer token. Expo builds both into the bundle when Metro starts, so restart Metro after changing them.

## Running on your phone over Tailscale

The phone can be on a different network from this computer, as long as both are on the tailnet. This works in Expo Go and in the phone's browser.

1. Start Rails on this computer's Tailscale address, as `backend/README.md` describes:

   ```bash
   bin/dev -b "$(tailscale ip -4)"
   ```

2. In `.env`, point the app at that address. On a phone, `localhost` means the phone itself.

   ```bash
   EXPO_PUBLIC_API_URL=http://<Tailscale IP or MagicDNS name>:3000
   ```

3. Start Metro on the same address. Otherwise Expo Go is given the LAN address, which doesn't work from another network. You don't need `--tunnel`.

   ```bash
   REACT_NATIVE_PACKAGER_HOSTNAME=<same address> npx expo start
   ```

4. Scan the QR code with Expo Go, or open `http://<same address>:8081` in the phone's browser.

Use plain `http`. Tailscale already encrypts the connection. If you open the web build over `https`, for example through `tailscale serve`, serve the API over `https` too, or the browser blocks its requests as mixed content.

## Checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```

`npm run format` fixes anything `format:check` reports.
