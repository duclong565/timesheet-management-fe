import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  tooltip?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  color,
  tooltip,
}: StatCardProps) {
  const content = (
    <>
      <span className={color}>{icon}</span>
      <span className="text-base font-medium">{label}</span>
    </>
  );
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center gap-2"
                  tabIndex={0}
                  aria-label={label}
                  role="button"
                >
                  {content}
                </div>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center gap-2" aria-label={label}>
            {content}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
