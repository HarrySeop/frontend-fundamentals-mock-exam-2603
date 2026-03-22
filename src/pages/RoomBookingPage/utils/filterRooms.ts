import type { Room, Reservation, Equipment } from '_tosslib/server/types';

interface FilterParams {
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
  date: string;
  startTime: string;
  endTime: string;
}

export function filterAvailableRooms(
  rooms: Room[],
  reservations: Reservation[],
  params: FilterParams,
): Room[] {
  const { attendees, equipment, preferredFloor, date, startTime, endTime } = params;

  return rooms
    .filter(room => {
      if (room.capacity < attendees) return false;
      if (!equipment.every(eq => room.equipment.includes(eq))) return false;
      if (preferredFloor !== null && room.floor !== preferredFloor) return false;
      const hasConflict = reservations.some(
        r => r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
      );
      if (hasConflict) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.name.localeCompare(b.name);
    });
}
