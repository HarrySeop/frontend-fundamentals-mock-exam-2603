import { css } from '@emotion/react';
import { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@suspensive/react';
import { useSuspenseQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Button, ListRow, Spacing } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS } from 'constants/equipment';
import { roomQueries, reservationQueries, myReservationQueries } from 'constants/queryKeys';
import { createReservation } from 'pages/remotes';
import { filterAvailableRooms } from '../utils/filterRooms';
import type { Equipment, Room } from '_tosslib/server/types';
import axios from 'axios';

interface AvailableRoomListProps {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
}

function AvailableRoomListContent({
  date, startTime, endTime, attendees, equipment, preferredFloor,
}: AvailableRoomListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [{ data: rooms }, { data: reservations }] = useSuspenseQueries({
    queries: [
      roomQueries.all(),
      date
        ? reservationQueries.byDate(date)
        : { queryKey: ['reservations', ''] as const, queryFn: () => Promise.resolve([]) },
    ],
  });

  const createMutation = useMutation({
    mutationFn: (data: { roomId: string; date: string; start: string; end: string; attendees: number; equipment: Equipment[] }) =>
      createReservation(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationQueries.byDate(variables.date).queryKey });
      queryClient.invalidateQueries({ queryKey: myReservationQueries.all().queryKey });
    },
  });

  const availableRooms = filterAvailableRooms(rooms as Room[], reservations, {
    attendees, equipment, preferredFloor, date, startTime, endTime,
  });

  const handleBook = async () => {
    if (!selectedRoomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('시작 시간과 종료 시간을 선택해주세요.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        roomId: selectedRoomId,
        date,
        start: startTime,
        end: endTime,
        attendees,
        equipment,
      });

      if ('ok' in result && result.ok) {
        navigate('/', { state: { message: '예약이 완료되었습니다!' } });
        return;
      }

      const errResult = result as { message?: string };
      setErrorMessage(errResult.message ?? '예약에 실패했습니다.');
      setSelectedRoomId(null);
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      setErrorMessage(serverMessage);
      setSelectedRoomId(null);
    }
  };

  return (
    <div css={css`padding: 0 24px;`}>
      {errorMessage && (
        <>
          <div
            css={css`
              padding: 10px 14px; border-radius: 10px; background: ${colors.red50};
              display: flex; align-items: center; gap: 8px;
            `}
          >
            <Text typography="t7" fontWeight="medium" color={colors.red500}>{errorMessage}</Text>
          </div>
          <Spacing size={12} />
        </>
      )}

      <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 가능 회의실
        </Text>
        <Text typography="t7" fontWeight="medium" color={colors.grey500}>
          {availableRooms.length}개
        </Text>
      </div>
      <Spacing size={16} />

      {availableRooms.length === 0 ? (
        <div css={css`padding: 40px 0; text-align: center; background: ${colors.grey50}; border-radius: 14px;`}>
          <Text typography="t6" color={colors.grey500}>
            조건에 맞는 회의실이 없습니다.
          </Text>
        </div>
      ) : (
        <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
          {availableRooms.map(room => {
            const isSelected = selectedRoomId === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                role="button"
                aria-pressed={isSelected}
                aria-label={room.name}
                css={css`
                  cursor: pointer; padding: 14px 16px; border-radius: 14px;
                  border: 2px solid ${isSelected ? colors.blue500 : colors.grey200};
                  background: ${isSelected ? colors.blue50 : colors.white};
                  transition: all 0.15s;
                  &:hover { border-color: ${isSelected ? colors.blue500 : colors.grey300}; }
                `}
              >
                <ListRow
                  contents={
                    <ListRow.Text2Rows
                      top={room.name}
                      topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                      bottom={`${room.floor}층 · ${room.capacity}명 · ${room.equipment.map(e => EQUIPMENT_LABELS[e]).join(', ')}`}
                      bottomProps={{ typography: 't7', color: colors.grey600 }}
                    />
                  }
                  right={
                    isSelected ? (
                      <Text typography="t7" fontWeight="bold" color={colors.blue500}>선택됨</Text>
                    ) : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      <Spacing size={16} />
      <Button display="full" onClick={handleBook} disabled={createMutation.isPending}>
        {createMutation.isPending ? '예약 중...' : '확정'}
      </Button>
    </div>
  );
}

AvailableRoomListContent.Loading = function AvailableRoomListLoading() {
  return (
    <div css={css`padding: 0 24px;`}>
      <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 가능 회의실
        </Text>
      </div>
      <Spacing size={16} />
      <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            css={css`
              padding: 14px 16px; border-radius: 14px; background: ${colors.grey50};
              border: 1px solid ${colors.grey200}; height: 64px;
              animation: pulse 1.5s ease-in-out infinite;
              @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}
          />
        ))}
      </div>
    </div>
  );
};

AvailableRoomListContent.Error = function AvailableRoomListError({ resetErrorBoundary }: { resetErrorBoundary?: () => void }) {
  return (
    <div css={css`
      padding: 0 24px;
    `}>
      <div css={css`
        background: ${colors.grey50}; border-radius: 14px; padding: 40px 16px;
        display: flex; flex-direction: column; align-items: center; gap: 12px;
      `}>
        <Text typography="t6" color={colors.grey500}>
          회의실 목록을 불러오지 못했습니다
        </Text>
        {resetErrorBoundary && (
          <Button size="small" style="weak" onClick={resetErrorBoundary}>
            재시도
          </Button>
        )}
      </div>
    </div>
  );
};

export function AvailableRoomList(props: AvailableRoomListProps) {
  return (
    <ErrorBoundary
      resetKeys={[props.date, props.startTime, props.endTime]}
      fallback={({ reset }) => <AvailableRoomListContent.Error resetErrorBoundary={reset} />}
    >
      <Suspense fallback={<AvailableRoomListContent.Loading />}>
        <AvailableRoomListContent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
