import type { ImageSourcePropType } from 'react-native';

export type FSlot = 'pine' | 'grass' | 'fern' | 'frog' | 'fairy' | 'toucan' | 'leaf' | 'eyes' | 'sparkle';

export const FA: Record<FSlot, ImageSourcePropType | null> = {
  pine: require('../../assets/forest/pine.gif'),
  grass: require('../../assets/forest/grass.jpg'),
  fern: require('../../assets/forest/fern.gif'),
  frog: require('../../assets/forest/frog.gif'),
  fairy: require('../../assets/forest/fairy.gif'),
  toucan: require('../../assets/forest/toucan.gif'),
  leaf: require('../../assets/forest/leaf.gif'),      
  eyes: require('../../assets/forest/eyes.gif'),    
  sparkle: require('../../assets/forest/sparkle.gif'),
};