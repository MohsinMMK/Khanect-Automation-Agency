import { Table } from '@tanstack/react-table';
import { Input } from './input';
import { Button } from './button';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: {
    column: string;
    title: string;
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  }[];
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = 'Search...',
  filters,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {searchKey && (
        <div className="relative flex-1 max-w-sm">
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="pl-9 h-10"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {filters?.map((filter) => {
          const column = table.getColumn(filter.column);
          if (!column) return null;
          return (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          );
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
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
              className="ml-2 h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
