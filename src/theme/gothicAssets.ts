import type { ImageSourcePropType } from 'react-native';
export type Slot =
  | 'granite' | 'title'
  | 'tilePane'   // tile for the permissions pane (chain link, barbed wire, smoke...)
  | 'eye' | 'skull' | 'candle' | 'torch' | 'bones';

export const ASSETS: Record<Slot, ImageSourcePropType | null> = {
  granite: require('../../assets/gothic/granite.jpg'),
  tilePane: null,
  title: require('../../assets/gothic/title.png'),
  eye: require('../../assets/gothic/eye.gif'),
  skull: require('../../assets/gothic/skeleton.gif'),
  candle: require('../../assets/gothic/candle.gif'),
  torch: require('../../assets/gothic/torch.gif'),
  bones: require('../../assets/gothic/skull.gif'),
};