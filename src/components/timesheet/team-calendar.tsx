'use client';

import { eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { TeamCalendarData } from '@/types/team-calendar';
import { cn } from '@/lib/utils';

interface TeamCalendarProps {
  data: TeamCalendarData;
}

export function TeamCalendar({ data }: TeamCalendarProps) {
  const { month, year, users } = data;
  const currentDate = new Date(year, month - 1);
  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-sm font-medium">
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayNumber = day.getDate();
          const isCurrentMonth = day.getMonth() === month - 1;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          const entries = isCurrentMonth
            ? users.flatMap((user) => {
                const entry = user.days[dayNumber - 1];
                return entry ? [{ ...entry, user: user.user }] : [];
              })
            : [];

          return (
            <Card
              key={format(day, 'yyyy-MM-dd')}
              className={cn(
                'h-24 p-2',
                !isCurrentMonth && 'bg-muted/50 text-muted-foreground',
                isWeekend && isCurrentMonth && 'bg-muted/40'
              )}
            >
              <div className="text-right text-xs">{dayNumber}</div>
              <div className="mt-1 flex flex-col gap-1">
                {entries.map((entry) => (
                  <Badge
                    key={entry.user.id}
                    variant="secondary"
                    className="w-full justify-start text-[10px]"
                  >
                    {entry.user.name}
                    {entry.project?.name && ` - ${entry.project.name}`}
                    {entry.absence_type && ` - ${entry.absence_type}`}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

