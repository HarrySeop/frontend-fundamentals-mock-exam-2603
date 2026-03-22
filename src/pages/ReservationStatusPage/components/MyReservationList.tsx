import { css } from '@emotion/react';
import { useSuspenseQueries } from '@tanstack/react-query';
import { Button, Text, ListRow, Spacing } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS } from 'constants/equipment';
import { roomQueries, myReservationQueries } from 'constants/queryKeys';

interface MyReservationListProps {
  onCancel: (id: string) => void;
}

export function MyReservationList({ onCancel }: MyReservationListProps) {
  const [{ data: rooms }, { data: reservations }] = useSuspenseQueries({
    queries: [roomQueries.all(), myReservationQueries.all()],
  });
  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? roomId;

  return (
    <>
      <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          내 예약
        </Text>
        {reservations.length > 0 && (
          <Text typography="t7" fontWeight="medium" color={colors.grey500}>
            {reservations.length}건
          </Text>
        )}
      </div>
      <Spacing size={16} />

      {reservations.length === 0 ? (
        <div css={css`padding: 40px 0; text-align: center; background: ${colors.grey50}; border-radius: 14px;`}>
          <Text typography="t6" color={colors.grey500}>
            예약 내역이 없습니다.
          </Text>
        </div>
      ) : (
        <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
          {reservations.map(res => (
            <div
              key={res.id}
              css={css`padding: 14px 16px; border-radius: 14px; background: ${colors.grey50}; border: 1px solid ${colors.grey200};`}
            >
              <ListRow
                contents={
                  <ListRow.Text2Rows
                    top={getRoomName(res.roomId)}
                    topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                    bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${res.equipment.map(e => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'}`}
                    bottomProps={{ typography: 't7', color: colors.grey600 }}
                  />
                }
                right={
                  <Button
                    type="danger"
                    style="weak"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('정말 취소하시겠습니까?')) {
                        onCancel(res.id);
                      }
                    }}
                  >
                    취소
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

MyReservationList.Loading = function MyReservationListLoading() {
  return (
    <>
      <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          내 예약
        </Text>
      </div>
      <Spacing size={16} />
      <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
        {Array.from({ length: 2 }).map((_, i) => (
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
    </>
  );
};

MyReservationList.Error = function MyReservationListError({ resetErrorBoundary }: { resetErrorBoundary?: () => void }) {
  return (
    <>
      <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          내 예약
        </Text>
      </div>
      <Spacing size={16} />
      <div css={css`
        background: ${colors.grey50}; border-radius: 14px; padding: 40px 16px;
        display: flex; flex-direction: column; align-items: center; gap: 12px;
      `}>
        <Text typography="t6" color={colors.grey500}>
          내 예약을 불러오지 못했습니다
        </Text>
        {resetErrorBoundary && (
          <Button size="small" style="weak" onClick={resetErrorBoundary}>
            재시도
          </Button>
        )}
      </div>
    </>
  );
};
