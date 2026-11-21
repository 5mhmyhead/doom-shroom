import type { ImageSourcePropType } from 'react-native';

export type Slot =
  | 'granite'
  | 'title'
  | 'tilePane'
  | 'eye'
  | 'skull'
  | 'candle'
  | 'torch'
  | 'bones'
  | 'permCandle'
  | 'permSkull';

export const ASSETS: Record<Slot, ImageSourcePropType | null> = {
  granite: require('../../assets/gothic/granite.jpg'),
  tilePane: require('../../assets/gothic/metal.jpg'),
  title: require('../../assets/gothic/title.png'),
  eye: require('../../assets/gothic/eye.gif'),
  skull: require('../../assets/gothic/skeleton.gif'),
  candle: require('../../assets/gothic/candle.gif'),
  torch: require('../../assets/gothic/torch.gif'),
  bones: require('../../assets/gothic/skull.gif'),
  permCandle: require('../../assets/gothic/candle.gif'),
  permSkull: require('../../assets/gothic/skull.gif'),
};