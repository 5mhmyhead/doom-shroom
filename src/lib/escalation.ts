export const MAX_LEVEL = 5;

export const levelFor = (interruptions: number) => Math.min(interruptions, MAX_LEVEL);