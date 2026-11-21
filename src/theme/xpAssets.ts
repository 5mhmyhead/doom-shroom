import type { ImageSourcePropType } from 'react-native';

// null = the code-drawn fallback is used. Save files in assets/xp/ and swap `null` for a
// require() once the file exists (Metro fails the build on a missing file). A remote
// { uri: 'https://...' } also works, but it needs network at demo time, so prefer local files.
export const XA: Record<'wallpaper' | 'taskbarBar' | 'startButton', ImageSourcePropType | null> = {
  wallpaper: require('../../assets/xp/wallpaper.jpg'),
  taskbarBar: require('../../assets/xp/taskbar.png'),
  startButton: require('../../assets/xp/start.jpg'),
};

// Taskbar height in dp, and the Start button's width / height ratio (XP's is about 3.3).
export const TASKBAR_HEIGHT = 40;
export const START_ASPECT = 3.3;