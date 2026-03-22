/** "HH:mm" 형식의 시간을 분 단위로 변환 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
