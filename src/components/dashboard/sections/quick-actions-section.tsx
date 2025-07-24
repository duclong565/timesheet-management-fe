import { QuickAction } from '@/types/dashboard';
import QuickActions from '../widgets/quick-actions';

interface QuickActionsSectionProps {
  actions?: QuickAction[];
}

export default function QuickActionsSection({
  actions = [],
}: QuickActionsSectionProps) {
  return <QuickActions actions={actions} />;
}
