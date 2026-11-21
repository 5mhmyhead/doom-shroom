import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';

export const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export type InstalledApp = { packageName: string; name: string };
export type BlockedLink = { app: string; pkg: string; reason: 'opened' | 'expired' | string };

type BlockerModule = typeof import('expo-app-blocker');
type LauncherModule = typeof import('../../modules/app-launcher');

let Blocker: BlockerModule | null = null;
let Launcher: LauncherModule | null = null;

if (!IS_EXPO_GO) {
  try {
    Blocker = require('expo-app-blocker');
  } catch (e) {
    console.warn('expo-app-blocker unavailable', e);
  }
  try {
    Launcher = require('../../modules/app-launcher');
  } catch (e) {
    console.warn('app-launcher unavailable', e);
  }
}

// ---- permissions
export const getPermissions = async () =>
  Blocker
    ? Blocker.getPermissionStatus()
    : { allGranted: true, details: { overlay: true, usageStats: true, notifications: true } };
export const openOverlaySettings = () => Blocker?.openOverlaySettings();
export const openUsageSettings = () => Blocker?.openUsageStatsSettings();

// ---- apps (fakes in Expo Go so the picker still has something to show)
const FAKE_APPS: InstalledApp[] = [
  { packageName: 'fake.instagram', name: 'Instagram (fake)' },
  { packageName: 'fake.tiktok', name: 'TikTok (fake)' },
  { packageName: 'fake.youtube', name: 'YouTube (fake)' },
];
let fakeBlocked: string[] = [];

export const loadInstalledApps = async (): Promise<InstalledApp[]> => {
  if (!Blocker) return FAKE_APPS;
  const apps = (await Blocker.getInstalledApps()) as InstalledApp[];
  return [...(apps ?? [])].sort((a, b) => a.name.localeCompare(b.name));
};

export const getBlocked = (): string[] => (Blocker ? Blocker.getBlockedApps() : fakeBlocked);
export const setBlocked = (pkgs: string[]) => {
  if (Blocker) Blocker.setBlockedApps(pkgs);
  else fakeBlocked = pkgs;
};

// ---- monitoring
export const startMonitor = () => Blocker?.startMonitoring();
export const stopMonitor = () => Blocker?.stopMonitoring();

export const grantWindow = async (seconds: number) => {
  await Blocker?.temporaryUnlock(seconds / 60);
};

export const styleOverlay = () =>
  Blocker?.configureAndroid?.({
    overlayTitle: 'Please wait',
    overlayText: 'Checking app access...',
    overlayBackgroundColor: '#FFFFFF',
    overlayTitleColor: '#0000EE',
    overlayTextColor: '#000000',
    overlayTitleFontSize: 44,
    overlayTextFontSize: 11,
    overlayTitleBold: false,
    overlayShowSpinner: true,
    notificationTitle: 'doom shroom',
    notificationText: 'Monitoring blocked apps.',
  });

export function parseBlockedLink(url: string | null): BlockedLink | null {
  if (!url) return null;
  const parsed = Linking.parse(url);
  if (parsed.hostname !== 'blocked' && parsed.path !== 'blocked') return null;
  const q = parsed.queryParams ?? {};
  return {
    app: String(q.app ?? 'this app'),
    pkg: String(q.package ?? ''),
    reason: String(q.reason ?? 'opened'),
  };
}

export async function returnToApp(pkg: string): Promise<boolean> {
  if (!pkg || !Launcher) return false;
  try {
    return await Launcher.launchApp(pkg);
  } catch {
    return false;
  }
}