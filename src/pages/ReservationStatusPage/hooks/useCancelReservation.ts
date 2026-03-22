import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelReservation } from 'pages/remotes';
import { reservationQueries, myReservationQueries } from 'constants/queryKeys';

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries(reservationQueries.all());
      queryClient.invalidateQueries({ queryKey: myReservationQueries.all().queryKey });
    },
  });
}
