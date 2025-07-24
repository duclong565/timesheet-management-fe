import { ChartData } from '@/types/dashboard';
import ChartCard from '../widgets/chart-card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardPieChartProps {
  chart: ChartData;
}

const pieChartConfig = {
  APPROVED: {
    label: 'Approved',
    color: '#10B981',
  },
  PENDING: {
    label: 'Pending',
    color: '#F59E0B',
  },
  REJECTED: {
    label: 'Rejected',
    color: '#EF4444',
  },
} satisfies ChartConfig;

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366f1', '#818CF8'];

export default function DashboardPieChart({ chart }: DashboardPieChartProps) {
  const isDonut = chart.type === 'DONUT';

  return (
    <ChartCard title={chart.title}>
      <ChartContainer config={pieChartConfig}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chart.data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={isDonut ? 50 : 0}
              outerRadius={80}
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {chart.data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.label || entry.value}-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="bg-background border rounded p-2 shadow-md">
                      <p className="font-medium">{data.name}</p>
                      <p style={{ color: data.color }}>Count: {data.value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}
