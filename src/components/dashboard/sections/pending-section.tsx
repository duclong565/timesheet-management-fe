import { PendingItem } from '@/types/dashboard';
import PendingItemsList from '../widgets/pending-items-list';
import EmptyState from '../widgets/empty-state';

interface PendingSectionProps {
  items?: PendingItem[];
}

export default function PendingSection({ items = [] }: PendingSectionProps) {
  if (items.length === 0) {
    return <EmptyState message="No pending items. You're all caught up!" />;
  }

  return <PendingItemsList items={items} />;
}
