import { launchApp } from '../../modules/app-launcher';
import * as Blocker from 'expo-app-blocker';
import * as Linking from 'expo-linking';

export type InstalledApp = { packageName: string; name: string };
export type BlockedLink = { app: string; pkg: string; reason: 'opened' | 'expired' | string };

export const getPermissions = () => Blocker.getPermissionStatus();
export const openOverlaySettings = () => Blocker.openOverlaySettings();
export const openUsageSettings = () => Blocker.openUsageStatsSettings();

export const loadInstalledApps = async (): Promise<InstalledApp[]> => {
  const apps = (await Blocker.getInstalledApps()) as InstalledApp[];
  return [...(apps ?? [])].sort((a, b) => a.name.localeCompare(b.name));
};

export const getBlocked = (): string[] => Blocker.getBlockedApps();
export const setBlocked = (pkgs: string[]) => Blocker.setBlockedApps(pkgs);

export const startMonitor = () => Blocker.startMonitoring();
export const stopMonitor = () => Blocker.stopMonitoring();

export const grantWindow = (seconds: number) => Blocker.temporaryUnlock(seconds / 60);

export const styleOverlay = () =>
  Blocker.configureAndroid?.({
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
  if (!pkg) return false;
  try {
    return await launchApp(pkg);
  } catch {
    return false;
  }
}