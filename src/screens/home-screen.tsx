import { useEffect, useMemo, useState } from 'react';
import { FlatList, PermissionsAndroid, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

type Props = {
  intervalSec: number;
  setIntervalSec: (n: number) => void;
  interruptions: number;
  monitoring: boolean;
  setMonitoring: (v: boolean) => void;
  onDev: (index: number) => void;
};

type Perm = { overlay: boolean; usageStats: boolean; notifications: boolean };

const Link = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <Text style={s.link}>{label}</Text>
  </Pressable>
);

const PermRow = ({ label, ok }: { label: string; ok: boolean }) => (
  <Text style={s.base}>
    [{ok ? 'x' : ' '}] {label} — {ok ? 'OK' : 'MISSING'}
  </Text>
);

export default function HomeScreen({
  intervalSec,
  setIntervalSec,
  interruptions,
  monitoring,
  setMonitoring,
  onDev,
}: Props) {
  const [perm, setPerm] = useState<Perm>({ overlay: false, usageStats: false, notifications: false });
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
    <View style={s.header}>
      <Text style={s.huge}>doom shroom</Text>
      <Text style={s.base}>SCREAM IF YOU LOVE DOOM SHROOM!!!.</Text>

      <Text style={s.h}>1. Permissions</Text>
      <PermRow label="Display over other apps" ok={perm.overlay} />
      <PermRow label="Usage access" ok={perm.usageStats} />
      <PermRow label="Notifications" ok={perm.notifications} />
      <Link label="open Display over other apps" onPress={openOverlaySettings} />
      <Link label="open Usage access" onPress={openUsageSettings} />
      <Link label="allow Notifications" onPress={askNotifications} />
      <Link label="refresh" onPress={refreshPerm} />

      <Text style={s.h}>2. Interval</Text>
      <Text style={s.base}>Allowed {intervalSec} seconds between interruptions.</Text>
      <View style={s.row}>
        <Link label="less (-5s)" onPress={() => setIntervalSec(Math.max(5, intervalSec - 5))} />
        <Link label="more (+5s)" onPress={() => setIntervalSec(intervalSec + 5)} />
      </View>

      <Text style={s.h}>3. Monitoring</Text>
      <Text style={s.base}>
        {monitoring ? 'RUNNING' : 'STOPPED'}. {blocked.length} apps listed. Interruptions so far: {interruptions}.
      </Text>
      <View style={s.row}>
        <Link label="start" onPress={() => { startMonitor(); setMonitoring(true); }} />
        <Link label="stop" onPress={() => { stopMonitor(); setMonitoring(false); }} />
      </View>

      <Text style={s.h}>4. Dev: run a popup</Text>
      {popups.map((c, i) => (
        <Link key={c.id} label={c.title} onPress={() => onDev(i)} />
      ))}

      <Text style={s.h}>5. Apps ({blocked.length} selected)</Text>
      <Link label="load installed apps" onPress={async () => setApps(await loadInstalledApps())} />
      <TextInput
        value={filter}
        onChangeText={setFilter}
        placeholder="filter"
        placeholderTextColor="#666666"
        style={s.input}
      />
    </View>
  );

  return (
    <FlatList
      style={s.page}
      contentContainerStyle={s.listContent}
      keyboardShouldPersistTaps="handled"
      data={shown}
      keyExtractor={(a) => a.packageName}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={s.empty}>(no items)</Text>}
      renderItem={({ item }) => (
        <Pressable onPress={() => toggle(item.packageName)} style={s.item}>
          <Text style={s.base}>
            [{blocked.includes(item.packageName) ? 'x' : ' '}] {item.name}
          </Text>
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  listContent: { paddingBottom: 40 },
  header: { padding: 12, paddingTop: 48, gap: 6 },
  huge: { fontFamily: 'serif', fontSize: 38, fontWeight: 'bold', color: '#000000' },
  h: { fontFamily: 'serif', fontSize: 22, marginTop: 14, color: '#000000' },
  base: { fontFamily: 'serif', fontSize: 16, color: '#000000' },
  link: { fontFamily: 'serif', fontSize: 16, color: '#0000EE', textDecorationLine: 'underline' },
  row: { flexDirection: 'row', gap: 16 },
  input: { borderWidth: 1, borderColor: '#000000', padding: 6, fontFamily: 'serif', color: '#000000' },
  empty: { paddingHorizontal: 12, paddingVertical: 6, fontFamily: 'serif', color: '#000000' },
  item: { paddingHorizontal: 12, paddingVertical: 6 },
});