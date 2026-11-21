import type { ComponentType } from 'react';

export type PopupProps = { onSolve: () => void; level: number };
export type Popup = { id: string; title: string; Component: ComponentType<PopupProps> };
