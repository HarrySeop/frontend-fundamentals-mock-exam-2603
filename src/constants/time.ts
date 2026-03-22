export const TIME_RANGE = {
  START: '09:00',
  END: '20:00',
  INTERVAL: 30,
} as const;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const startHour = parseInt(TIME_RANGE.START.split(':')[0], 10);
  const endHour = parseInt(TIME_RANGE.END.split(':')[0], 10);
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < endHour) {
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

/** 시작 시간 선택지: 09:00 ~ 19:30 */
export const START_TIME_OPTIONS = TIME_SLOTS.slice(0, -1);

/** 종료 시간 선택지: 09:30 ~ 20:00 */
export const END_TIME_OPTIONS = TIME_SLOTS.slice(1);

/** 정시 레이블 (타임라인 헤더용): 09:00, 10:00, ... 20:00 */
export const HOUR_LABELS = TIME_SLOTS.filter(t => t.endsWith(':00'));
