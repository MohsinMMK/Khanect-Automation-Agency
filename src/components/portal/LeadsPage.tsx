import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { DataTable } from '@/components/ui/data-table';
import { DataTableToolbar } from '@/components/ui/data-table-toolbar';
import { columns, categoryFilterOptions, statusFilterOptions } from './leads/columns';
import { LeadDetailSheet } from './leads/LeadDetailSheet';
import { getLeads } from '@/services/leadsService';
import type { Lead, LeadFilters } from '@/types/portal';
import { toast } from 'sonner';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Detail sheet state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Get filters from URL params
  const getFiltersFromParams = useCallback((): LeadFilters => {
    return {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category')?.split(',') as LeadFilters['category'],
      status: searchParams.get('status')?.split(',') as LeadFilters['status'],
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };
  }, [searchParams]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    const filters = getFiltersFromParams();
    
    const result = await getLeads(filters);
    
    if (result.success && result.data) {
      setLeads(result.data);
      setTotalCount(result.count || result.data.length);
    } else {
      toast.error(result.error?.message || 'Failed to fetch leads');
      setLeads([]);
    }
    
    setIsLoading(false);
  }, [getFiltersFromParams]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Create table instance
  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Handle row click to open detail sheet
  const handleRowClick = useCallback((lead: Lead) => {
    setSelectedLeadId(lead.id);
    setIsDetailOpen(true);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <SEO
        title="Leads - Client Portal - Khanect AI"
        description="Manage your leads and view lead scores."
        noindex={true}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isLoading ? 'Loading...' : `${totalCount} total leads`}
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
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
            className={isLoading ? 'animate-spin' : ''}
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table with toolbar */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.06]">
          <DataTableToolbar
            table={table}
            searchKey="full_name"
            searchPlaceholder="Search by name, email, or business..."
            filters={[
              {
                column: 'lead_score',
                title: 'Category',
                options: categoryFilterOptions,
              },
              {
                column: 'processing_status',
                title: 'Status',
                options: statusFilterOptions,
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={leads}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          emptyState={
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand-lime"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No leads yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                When visitors submit the contact form, their information will appear here.
              </p>
            </div>
          }
        />
      </div>

      {/* Lead Detail Sheet */}
      <LeadDetailSheet
        leadId={selectedLeadId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
