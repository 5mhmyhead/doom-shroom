import { useEffect, useMemo, useState } from 'react';
import { FlatList, PermissionsAndroid, StyleSheet, View } from 'react-native';
import {
  InstalledApp,
  getBlocked,
  getPermissions,
  loadInstalledApps,
  openOverlaySettings,
  openUsageSettings,
  setBlocked,
  startMonitor,
  stopMonitor,
} from '../lib/blocker';
import { popups } from '../popups/registry';
import { GothicGraniteSection, GothicMasthead, GothicPermissions, PermState } from '../theme/gothic';
import { KawaiiIntervalSection } from '../theme/kawaii';
import { ForestDevSection, ForestMonitoringSection } from '../theme/forest';
import { HellAppsHeader, HellEmpty, HellFooter, HellRow } from '../theme/hell';

type Props = {
  intervalSec: number;
  setIntervalSec: (n: number) => void;
  interruptions: number;
  monitoring: boolean;
  setMonitoring: (v: boolean) => void;
  onDev: (index: number) => void;
};

export default function HomeScreen({
  intervalSec,
  setIntervalSec,
  interruptions,
  monitoring,
  setMonitoring,
  onDev,
}: Props) {
  const [perm, setPerm] = useState<PermState>({ overlay: false, usageStats: false, notifications: false });
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [blocked, setBlockedState] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  const refreshPerm = async () => {
    const p = await getPermissions();
    const d = p.details as unknown as Record<string, unknown>;
    setPerm({ overlay: !!d.overlay, usageStats: !!d.usageStats, notifications: !!d.notifications });
  };

  useEffect(() => {
    refreshPerm();
    Promise.resolve(getBlocked()).then((list) => {
      if (Array.isArray(list)) setBlockedState(list);
    });
  }, []);

  const shown = useMemo(
    () => apps.filter((a) => a.name.toLowerCase().includes(filter.toLowerCase())),
    [apps, filter],
  );

  const toggle = (pkg: string) => {
    const next = blocked.includes(pkg) ? blocked.filter((p) => p !== pkg) : [...blocked, pkg];
    setBlockedState(next);
    setBlocked(next);
  };

  const askNotifications = async () => {
    await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS' as any);
    refreshPerm();
  };

  const header = (
    <View>
      {/* SECTION 1: gothic masthead + permissions */}
      <GothicGraniteSection>
        <GothicMasthead interruptions={interruptions} />
        <GothicPermissions
          perm={perm}
          onOverlay={openOverlaySettings}
          onUsage={openUsageSettings}
          onNotify={askNotifications}
          onRefresh={refreshPerm}
        />
      </GothicGraniteSection>

      {/* SECTION 2: kawaii interval */}
      <KawaiiIntervalSection intervalSec={intervalSec} setIntervalSec={setIntervalSec} />

      {/* SECTIONS 3-4: forest monitoring + dev popups */}
      <ForestMonitoringSection
        monitoring={monitoring}
        appsListed={blocked.length}
        interruptions={interruptions}
        onStart={() => { startMonitor(); setMonitoring(true); }}
        onStop={() => { stopMonitor(); setMonitoring(false); }}
      />
      <ForestDevSection items={popups.map((p) => ({ id: p.id, title: p.title }))} onPick={onDev} />

      {/* SECTION 5: hell apps (header: title, load button, filter) */}
      <HellAppsHeader
        selectedCount={blocked.length}
        filter={filter}
        onFilter={setFilter}
        onLoad={async () => setApps(await loadInstalledApps())}
      />
    </View>
  );

  return (
    <FlatList
      style={s.page}
      keyboardShouldPersistTaps="handled"
      data={shown}
      keyExtractor={(a) => a.packageName}
      ListHeaderComponent={header}
      ListEmptyComponent={<HellEmpty />}
      ListFooterComponent={<HellFooter />}
      renderItem={({ item, index }) => (
        <HellRow
          name={item.name}
          on={blocked.includes(item.packageName)}
          alt={index % 2 === 1}
          onPress={() => toggle(item.packageName)}
        />
      )}
    />
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#120000' },
});