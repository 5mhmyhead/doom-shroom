import { requireNativeModule } from 'expo-modules-core';

const AppLauncher = requireNativeModule('AppLauncher');

export const launchApp = (pkg: string): boolean => AppLauncher.launch(pkg);