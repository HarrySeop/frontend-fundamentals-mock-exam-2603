import type { Equipment } from '_tosslib/server/types';

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

export const EQUIPMENT_LIST: Equipment[] = Object.keys(EQUIPMENT_LABELS) as Equipment[];
