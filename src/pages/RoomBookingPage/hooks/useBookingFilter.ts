import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Equipment } from '_tosslib/server/types';
import { formatDate } from 'utils/date';

interface UseBookingFilterOptions {
  onFilterChange?: () => void;
}

export function useBookingFilter({ onFilterChange }: UseBookingFilterOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [date, setDate] = useState(searchParams.get('date') || formatDate(new Date()));
  const [startTime, setStartTime] = useState(searchParams.get('startTime') || '');
  const [endTime, setEndTime] = useState(searchParams.get('endTime') || '');
  const [attendees, setAttendees] = useState(Number(searchParams.get('attendees')) || 1);
  const [equipment, setEquipment] = useState<Equipment[]>(
    searchParams.get('equipment') ? searchParams.get('equipment')!.split(',').filter(Boolean) as Equipment[] : []
  );
  const [preferredFloor, setPreferredFloor] = useState<number | null>(
    searchParams.get('floor') ? Number(searchParams.get('floor')) : null
  );

  useEffect(() => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (attendees > 1) params.attendees = String(attendees);
    if (equipment.length > 0) params.equipment = equipment.join(',');
    if (preferredFloor !== null) params.floor = String(preferredFloor);
    setSearchParams(params, { replace: true });
  }, [date, startTime, endTime, attendees, equipment, preferredFloor, setSearchParams]);

  let validationError: string | null = null;
  const hasTimeInputs = startTime !== '' && endTime !== '';
  if (hasTimeInputs) {
    if (endTime <= startTime) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (attendees < 1) {
      validationError = '참석 인원은 1명 이상이어야 합니다.';
    }
  }
  const isFilterComplete = hasTimeInputs && !validationError;

  const wrapSetter = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
    setter(value);
    onFilterChange?.();
  };

  return {
    date, setDate: wrapSetter(setDate),
    startTime, setStartTime: wrapSetter(setStartTime),
    endTime, setEndTime: wrapSetter(setEndTime),
    attendees, setAttendees: wrapSetter(setAttendees),
    equipment, setEquipment: wrapSetter(setEquipment),
    preferredFloor, setPreferredFloor: wrapSetter(setPreferredFloor),
    validationError,
    isFilterComplete,
  };
}
