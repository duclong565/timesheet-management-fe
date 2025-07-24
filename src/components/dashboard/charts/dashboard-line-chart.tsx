import { ChartData } from '@/types/dashboard';
import ChartCard from '../widgets/chart-card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface DashboardLineChartProps {
  chart: ChartData;
}

const lineChartConfig = {
  value: {
    label: 'Hours',
    color: '#6366f1',
  },
} satisfies ChartConfig;

export default function DashboardLineChart({ chart }: DashboardLineChartProps) {
  return (
    <ChartCard title={chart.title}>
      <ChartContainer config={lineChartConfig}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={chart.data}
            margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded p-2 shadow-md">
                      <p className="font-medium">{label}</p>
                      <p className="text-primary">Hours: {payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}
