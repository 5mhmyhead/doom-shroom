import type { ImageSourcePropType } from 'react-native';

export type KSlot =
  | 'tile'
  | 'hen'
  | 'cat'
  | 'fruit'
  | 'star'
  | 'anime'
  | 'bamboo'
  | 'rainbow'
  | 'ad1'
  | 'ad2'
  | 'ad3';

export const KA: Record<KSlot, ImageSourcePropType | null> = {
  tile: require('../../assets/kawaii/tile.png'),
  hen: require('../../assets/kawaii/butterfly.gif'),
  cat: require('../../assets/kawaii/cat.gif'),
  fruit: require('../../assets/kawaii/fruit.gif'),
  star: require('../../assets/kawaii/star.gif'),
  anime: require('../../assets/kawaii/anime.gif'),
  bamboo: require('../../assets/kawaii/bamboo.gif'),
  rainbow: require('../../assets/kawaii/rainbow.gif'),
  ad1: require('../../assets/kawaii/ad-1.gif'),
  ad2: require('../../assets/kawaii/ad-2.gif'),
  ad3: require('../../assets/kawaii/ad-3.gif'),
};