import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Top, Spacing, Border, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { roomQueries } from 'constants/queryKeys';
import { useBookingFilter } from './hooks/useBookingFilter';
import { FilterPanel } from './components/FilterPanel';
import { AvailableRoomList } from './components/AvailableRoomList';

export function RoomBookingPage() {
  const navigate = useNavigate();

  const filter = useBookingFilter();

  const { data: rooms = [] } = useQuery(roomQueries.all());
  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

  return (
    <div css={css`background: ${colors.white}; padding-bottom: 40px;`}>
      <div css={css`padding: 12px 24px 0;`}>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="뒤로가기"
          css={css`
            background: none; border: none; padding: 0; cursor: pointer; font-size: 14px;
            color: ${colors.grey600}; &:hover { color: ${colors.grey900}; }
          `}
        >
          ← 예약 현황으로
        </button>
      </div>
      <Top.Top03 css={css`padding-left: 24px; padding-right: 24px;`}>
        예약하기
      </Top.Top03>

      <Spacing size={24} />

      <FilterPanel
        date={filter.date}
        startTime={filter.startTime}
        endTime={filter.endTime}
        attendees={filter.attendees}
        equipment={filter.equipment}
        preferredFloor={filter.preferredFloor}
        floors={floors}
        validationError={filter.validationError}
        onDateChange={filter.setDate}
        onStartTimeChange={filter.setStartTime}
        onEndTimeChange={filter.setEndTime}
        onAttendeesChange={filter.setAttendees}
        onEquipmentChange={filter.setEquipment}
        onPreferredFloorChange={filter.setPreferredFloor}
      />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {filter.isFilterComplete && (
        <AvailableRoomList
          date={filter.date}
          startTime={filter.startTime}
          endTime={filter.endTime}
          attendees={filter.attendees}
          equipment={filter.equipment}
          preferredFloor={filter.preferredFloor}
        />
      )}

      <Spacing size={24} />
    </div>
  );
}
