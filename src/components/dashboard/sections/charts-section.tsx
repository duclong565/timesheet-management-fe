import { ChartData } from '@/types/dashboard';
import DashboardLineChart from '../charts/dashboard-line-chart';
import DashboardPieChart from '../charts/dashboard-pie-chart';
import EmptyState from '../widgets/empty-state';
import { Info } from 'lucide-react';

interface ChartsSectionProps {
  charts?: ChartData[];
}

function useChartValidation() {
  const isValidChart = (chart: ChartData): boolean => {
    if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
      return false;
    }
    return chart.data.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        ('label' in item || 'name' in item) &&
        'value' in item &&
        typeof item.value === 'number',
    );
  };

  return { isValidChart };
}

export default function ChartsSection({ charts = [] }: ChartsSectionProps) {
  const { isValidChart } = useChartValidation();

  if (charts.length === 0) {
    return <EmptyState message="No charts to display." size="sm" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((chart, index) => {
        if (!isValidChart(chart)) {
          return (
            <div
              key={`invalid-chart-${index}`}
              className="text-center text-muted-foreground"
            >
              <Info className="w-8 h-8 mx-auto mb-2" />
              <p>No valid data for {chart.title}</p>
            </div>
          );
        }

        if (chart.type === 'LINE') {
          return <DashboardLineChart key={`line-${index}`} chart={chart} />;
        }

        if (chart.type === 'PIE' || chart.type === 'DONUT') {
          return <DashboardPieChart key={`pie-${index}`} chart={chart} />;
        }

        return (
          <div
            key={`unsupported-${index}`}
            className="text-center text-muted-foreground"
          >
            <Info className="w-8 h-8 mx-auto mb-2" />
            <p>Unsupported chart type: {chart.type}</p>
          </div>
        );
      })}
    </div>
  );
}
