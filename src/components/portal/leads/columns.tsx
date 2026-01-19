import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/types/portal';
import { cn } from '@/lib/utils';

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Helper function to format relative time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// Category badge styles
const categoryStyles = {
  hot: 'bg-red-500/10 text-red-500 border-red-500/20',
  warm: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  cold: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  unqualified: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

// Status badge styles
const statusStyles = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue('full_name') as string;
      const business = row.original.business_name;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">{name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{business}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      return (
        <span className="text-gray-600 dark:text-gray-300">{email}</span>
      );
    },
  },
  {
    accessorKey: 'lead_score',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score" />
    ),
    cell: ({ row }) => {
      const score = row.original.lead_score;
      if (!score) {
        return (
          <span className="text-gray-400 dark:text-gray-500 text-sm">
            Not scored
          </span>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900 dark:text-white">
              {score.score}
            </span>
            <Badge 
              variant="outline"
              className={cn(
                'text-xs capitalize',
                categoryStyles[score.category]
              )}
            >
              {score.category}
            </Badge>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const score = row.original.lead_score;
      if (!score) return false;
      return value.includes(score.category);
    },
  },
  {
    accessorKey: 'processing_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('processing_status') as Lead['processing_status'];
      return (
        <Badge 
          variant="outline"
          className={cn(
            'text-xs capitalize',
            statusStyles[status]
          )}
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('created_at') as string;
      return (
        <div className="flex flex-col">
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            {formatTimeAgo(dateStr)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(dateStr)}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Action menu will be added later
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      );
    },
  },
];

// Filter options for the toolbar
export const categoryFilterOptions = [
  { label: 'Hot', value: 'hot' },
  { label: 'Warm', value: 'warm' },
  { label: 'Cold', value: 'cold' },
  { label: 'Unqualified', value: 'unqualified' },
];

export const statusFilterOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];
