# 🍄 Doom Shroom

**Doom Shroom** is an experimental mobile productivity app that adds a playful challenge between you and distracting apps. Select apps to monitor, then complete a mini-challenge to temporarily regain access when an interruption occurs.

Built with **React Native**, **Expo**, and **TypeScript**, the project combines app-blocking tools with themed interfaces and mini-games.

> **Development status:** Work in progress. Native app-blocking behavior requires a compatible development or standalone build; Expo Go uses mock app data and does not enforce real app blocking.

## Features

- **Choose apps to monitor:** Load installed apps and select which ones to block.
- **Challenge-based access:** Solve a popup challenge when a monitored app triggers an interruption.
- **Temporary unlocks:** Configure a short access interval after completing a challenge.
- **Escalation:** Challenge levels respond to the number of interruptions.
- **Permission controls:** Check and open Android settings for overlay and usage-access permissions, plus notification permission requests.
- **Developer previews:** Launch challenges from within the app without waiting for an actual block event.
- **Themed UI:** Gothic, kawaii, forest, and hell-inspired interface sections.

### Available challenges

| Challenge | Description |
| --- | --- |
| Tic Tac Toe | A tic-tac-toe mini-game. |
| Math Equation | A math-based challenge with difficulty levels. |
| Osu Spinner | A spinner-style mini-game. |
| Hell-Capcha | You must pick related symbols. |
| I am not a Robot | Continue to agree. |

Challenge components are registered in [`src/popups/registry.ts`](src/popups/registry.ts).

## Tech stack

- **Expo SDK 58**
- **React 19** and **React Native 0.88**
- **TypeScript**
- **expo-app-blocker** for native app monitoring and blocking
- **expo-dev-client** for development builds
- **expo-audio**, **expo-haptics**, and other Expo modules
- **Custom native app-launcher module** for returning to a selected app

See [`package.json`](package.json) for the complete dependency list.

## Getting started

### Prerequisites

- Node.js and npm
- Git
- Android Studio with the Android SDK and a working Android development environment (for local Android builds)
- An Android device with USB debugging enabled, or an Android emulator
- A compatible Java/JDK toolchain for your installed Android build environment

### 1. Clone the repository

```bash
git clone https://github.com/5mhmyhead/doom-shroom.git
cd doom-shroom
```

### 2. Install dependencies

```bash
npm ci
```

The project uses `patch-package` in its postinstall script, so leave installation scripts enabled.

### 3. Build and launch on Android

```bash
npm run android
```

This invokes `expo run:android` and builds/installs a development version of the app on the connected Android device or emulator. Native code is required for actual blocking functionality.

### 4. Start the Metro development server

For an already installed development build:

```bash
npx expo start --dev-client
```

Open Doom Shroom on the device and connect it to the running development server. Keep Metro running while testing JavaScript changes.

> You generally do **not** need to rebuild after changing only JavaScript/TypeScript or styling. Rebuild when native dependencies, config plugins, or other native configuration changes.

## USB debugging and Android connection troubleshooting

For development on Windows using a physical Android device:

1. Enable **Developer options** and **USB debugging** on the phone.
2. Connect the phone by USB and accept the debugging authorization prompt.
3. Confirm that ADB detects the device:

   ```bash
   adb devices
   ```

4. Forward the Metro port through USB:

   ```bash
   adb reverse tcp:8081 tcp:8081
   adb reverse --list
   ```

5. Start Metro:

   ```bash
   npx expo start --dev-client --clear
   ```

6. Reopen the installed development build.

If the app reports **Connection refused**, verify that Metro is running and test `http://127.0.0.1:8081/status` on the development computer. It should respond with `packager-status:running`. If ADB reverse is correct and the error persists, verify the URL/host selected inside the development build, restart the app and Metro, and confirm that the installed build matches the current native configuration.

**Important:** Opening a development-server QR link in an ordinary browser is not the same as opening it in a compatible installed development build. The project uses the URL scheme `doomshroom`.

## Android permissions

Doom Shroom's native monitoring features depend on Android permissions and device settings. The home screen provides controls for:

- **Display over other apps** (overlay permission)
- **Usage access** (usage statistics permission)
- **Notifications** (where required by the Android version)

Grant only permissions you understand and need for testing. Behavior may vary by Android version and manufacturer.

## Project structure

```text
doom-shroom/
├── assets/                 # Images, icons, and other bundled assets
├── modules/
│   └── app-launcher/       # Custom native app-launching module
├── patches/                # Dependency patches applied after install
├── plugins/                # Expo config plugins
├── src/
│   ├── lib/                # Blocking logic and escalation helpers
│   ├── popups/             # Challenges and challenge registry
│   ├── screens/            # Home and popup screens
│   └── theme/              # Themed UI components
├── targets/                # Additional native/build target files
├── App.tsx                 # Root app component and screen state
├── app.json                # Expo app configuration
├── index.ts                # Application entry point
├── package.json            # Dependencies and npm scripts
└── tsconfig.json           # TypeScript configuration
```

## Development commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start Expo/Metro. |
| `npm run android` | Build and run Android locally. |
| `npm run ios` | Build and run iOS locally on a supported macOS setup. |
| `npm run web` | Start the Expo web development workflow (native app-blocking features are not available on web). |
| `npx tsc --noEmit` | Check TypeScript types. |
| `npx expo-doctor` | Inspect Expo dependency and configuration compatibility. |

For Expo-compatible dependencies, prefer:

```bash
npx expo install <package-name>
```

## How it works

1. Open Doom Shroom and review the requested permissions.
2. Load installed apps and select the apps you want to monitor.
3. Start monitoring.
4. When a selected app triggers a block event, Doom Shroom displays a challenge.
5. Complete the challenge to grant a temporary access window.
6. After that window expires, access may be interrupted again according to the native monitoring behavior.

The app also contains developer challenge previews for UI testing.

## Known limitations

- **Expo Go is for UI preview only.** The fallback implementation uses sample installed apps and does not start actual monitoring.
- **Native builds are required** for features provided by `expo-app-blocker` and the custom app launcher.
- **Android behavior may vary** by device and OS version; do not assume an overlay or monitoring service works identically everywhere.
- **iOS support may require additional entitlements and configuration.** Its presence in the Expo configuration does not imply all blocking functionality has been validated on iOS.
- This is an active development project, not a guaranteed device-wide restriction or security control.

## Contributing

Contributions, bug reports, and improvements are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Make your changes and test them on the relevant platform.
4. Commit your changes: `git commit -m "Describe your change"`.
5. Push the branch and open a pull request.

For project-specific development guidance, see [`AGENTS.md`](AGENTS.md).

## License

This repository includes an [MIT License](LICENSE). See the license file for its exact terms and copyright notice.

---

**Repository:** [github.com/5mhmyhead/doom-shroom](https://github.com/5mhmyhead/doom-shroom)
