
import type { ImageSourcePropType } from 'react-native';

// null = code-drawn fallback. Save files in assets/hell/ and swap `null` for a
// require() once the file exists (Metro fails the build on a missing file).
export type HSlot = 'fire' | 'rowTile' | 'devil' | 'skull' | 'volcano' | 'flame' | 'trident';

export const HA: Record<HSlot, ImageSourcePropType | null> = {
  fire: require('../../assets/hell/fire.gif'),
  rowTile: require('../../assets/hell/tile-rows.jpg'),
  devil: require('../../assets/hell/devil2.gif'),
  skull: require('../../assets/hell/skull.gif'),
  volcano: require('../../assets/hell/volcano.gif'),
  flame: require('../../assets/hell/flame.gif'), 
  trident: require('../../assets/hell/devil.gif'),
};