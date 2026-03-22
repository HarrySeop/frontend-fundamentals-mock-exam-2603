import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuspenseQueries } from '@tanstack/react-query';
import { Text, Button } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS } from 'constants/equipment';
import { HOUR_LABELS, TIME_RANGE } from 'constants/time';
import { roomQueries, reservationQueries } from 'constants/queryKeys';
import { timeToMinutes } from 'utils/time';

const TIMELINE_START_MINUTES = timeToMinutes(TIME_RANGE.START);
const TIMELINE_END_MINUTES = timeToMinutes(TIME_RANGE.END);
const TOTAL_MINUTES = TIMELINE_END_MINUTES - TIMELINE_START_MINUTES;

interface TimelineProps {
  date: string;
}

function minutesToTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export function Timeline({ date }: TimelineProps) {
  const navigate = useNavigate();
  const [{ data: rooms }, { data: reservations }] = useSuspenseQueries({
    queries: [
      roomQueries.all(),
      date
        ? reservationQueries.byDate(date)
        : { queryKey: ['reservations', ''] as const, queryFn: () => Promise.resolve([]) },
    ],
  });
  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const minutes = TIMELINE_START_MINUTES + ratio * TOTAL_MINUTES;
    const snapped = Math.max(Math.floor(minutes / 30) * 30, TIMELINE_START_MINUTES);
    navigate(`/booking?date=${date}&startTime=${minutesToTime(snapped)}`);
  };

  return (
    <div css={css`background: ${colors.grey50}; border-radius: 14px; padding: 16px;`}>
      {/* 시간 헤더 */}
      <div css={css`display: flex; align-items: flex-end; margin-bottom: 8px;`}>
        <div css={css`width: 80px; flex-shrink: 0; padding-right: 8px;`} />
        <div css={css`flex: 1; position: relative; height: 18px;`}>
          {HOUR_LABELS.map(t => {
            const left = ((timeToMinutes(t) - TIMELINE_START_MINUTES) / TOTAL_MINUTES) * 100;
            return (
              <Text
                key={t}
                typography="t7"
                fontWeight="regular"
                color={colors.grey400}
                css={css`
                  position: absolute; left: ${left}%; transform: translateX(-50%);
                  font-size: 10px; letter-spacing: -0.3px;
                `}
              >
                {t.slice(0, 2)}
              </Text>
            );
          })}
        </div>
      </div>

      {/* 회의실별 타임라인 */}
      {rooms.map((room, index) => {
        const roomReservations = reservations.filter(r => r.roomId === room.id);
        return (
          <div
            key={room.id}
            css={css`display: flex; align-items: center; height: 32px; ${index > 0 ? 'margin-top: 4px;' : ''}`}
          >
            <div css={css`width: 80px; flex-shrink: 0; padding-right: 8px;`}>
              <Text typography="t7" fontWeight="medium" color={colors.grey700} ellipsisAfterLines={1}
                css={css`font-size: 12px;`}
              >
                {room.name}
              </Text>
            </div>
            <div
              role="button"
              aria-label={`${room.name} 빈 시간 예약`}
              onClick={handleSlotClick}
              css={css`flex: 1; height: 24px; background: ${colors.white}; border-radius: 6px; position: relative; overflow: visible; cursor: pointer;`}
            >
              {roomReservations.map(res => {
                const left = ((timeToMinutes(res.start) - TIMELINE_START_MINUTES) / TOTAL_MINUTES) * 100;
                const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
                const isActive = activeReservation === res.id;
                return (
                  <div key={res.id} css={css`position: absolute; left: ${left}%; width: ${width}%; height: 100%;`}>
                    <div
                      role="button"
                      aria-label={`${room.name} ${res.start}-${res.end} 예약 상세`}
                      onClick={(e) => { e.stopPropagation(); setActiveReservation(isActive ? null : res.id); }}
                      css={css`
                        width: 100%; height: 100%; background: ${colors.blue400}; border-radius: 4px;
                        opacity: ${isActive ? 1 : 0.75}; cursor: pointer; transition: opacity 0.15s;
                        &:hover { opacity: 1; }
                      `}
                    />
                    {isActive && (
                      <div
                        role="tooltip"
                        css={css`
                          position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 6px;
                          background: ${colors.grey900}; color: ${colors.white}; padding: 8px 12px;
                          border-radius: 8px; font-size: 12px; white-space: nowrap; z-index: 10;
                          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); line-height: 1.6;
                        `}
                      >
                        <div>{res.start} ~ {res.end}</div>
                        <div>{res.attendees}명</div>
                        {res.equipment.length > 0 && (
                          <div>{res.equipment.map(e => EQUIPMENT_LABELS[e]).join(', ')}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

Timeline.Loading = function TimelineLoading() {
  return (
    <div css={css`background: ${colors.grey50}; border-radius: 14px; padding: 16px;`}>
      <div css={css`display: flex; align-items: flex-end; margin-bottom: 8px;`}>
        <div css={css`width: 80px; flex-shrink: 0;`} />
        <div css={css`flex: 1; display: flex; justify-content: space-between;`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              css={css`
                width: 20px; height: 12px; background: ${colors.grey200};
                border-radius: 4px; animation: pulse 1.5s ease-in-out infinite;
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
              `}
            />
          ))}
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} css={css`display: flex; align-items: center; height: 32px; ${i > 0 ? 'margin-top: 4px;' : ''}`}>
          <div css={css`width: 80px; flex-shrink: 0; padding-right: 8px;`}>
            <div css={css`width: 48px; height: 14px; background: ${colors.grey200}; border-radius: 4px; animation: pulse 1.5s ease-in-out infinite;`} />
          </div>
          <div css={css`flex: 1; height: 24px; background: ${colors.white}; border-radius: 6px;`} />
        </div>
      ))}
    </div>
  );
};

Timeline.Error = function TimelineError({ resetErrorBoundary }: { resetErrorBoundary?: () => void }) {
  return (
    <div css={css`
      background: ${colors.grey50}; border-radius: 14px; padding: 40px 16px;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    `}>
      <Text typography="t6" color={colors.grey500}>
        예약 현황을 불러오지 못했습니다
      </Text>
      {resetErrorBoundary && (
        <Button size="small" style="weak" onClick={resetErrorBoundary}>
          재시도
        </Button>
      )}
    </div>
  );
};
