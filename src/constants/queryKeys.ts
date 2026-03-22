import { queryOptions } from '@tanstack/react-query';
import { getRooms, getReservations, getMyReservations } from 'pages/remotes';

export const roomQueries = {
  all: () => queryOptions({ queryKey: ['rooms'] as const, queryFn: getRooms }),
};

export const reservationQueries = {
  /** invalidateQueries용 부분 키 (모든 날짜의 예약) */
  all: () => ({ queryKey: ['reservations'] as const }),
  byDate: (date: string) =>
    queryOptions({
      queryKey: ['reservations', date] as const,
      queryFn: () => getReservations(date),
    }),
};

export const myReservationQueries = {
  all: () => queryOptions({ queryKey: ['myReservations'] as const, queryFn: getMyReservations }),
};
