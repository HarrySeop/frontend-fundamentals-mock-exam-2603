import { queryOptions } from '@tanstack/react-query';
import { getRooms, getReservations, getMyReservations } from 'pages/remotes';
import type { Reservation } from '_tosslib/server/types';

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
  /** 빈 날짜용 — useSuspenseQueries에서 enabled 대체 */
  empty: () =>
    queryOptions({
      queryKey: ['reservations', ''] as const,
      queryFn: () => Promise.resolve([] as Reservation[]),
    }),
};

export const myReservationQueries = {
  all: () => queryOptions({ queryKey: ['myReservations'] as const, queryFn: getMyReservations }),
};
