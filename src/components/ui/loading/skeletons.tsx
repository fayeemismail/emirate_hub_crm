'use client';

import React from 'react';
import { Skeleton, SkeletonCircle, SkeletonText, SkeletonPanel } from './Skeleton';

export const PageHeaderSkeleton: React.FC<{
  withSubtitle?: boolean;
  withAction?: boolean;
}> = ({ withSubtitle = true, withAction = false }) => (
  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
    <div className="space-y-2">
      <Skeleton className="h-5 w-36 sm:w-40" rounded="md" />
      {withSubtitle ? (
        <Skeleton className="h-3.5 w-48 sm:w-56" rounded="md" />
      ) : null}
    </div>
    {withAction ? (
      <Skeleton className="h-10 w-full sm:h-9 sm:w-40" rounded="lg" />
    ) : null}
  </div>
);

export const ToolbarSkeleton: React.FC<{ controls?: number }> = ({ controls = 4 }) => {
  const mobileCount = Math.min(2, controls);
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <Skeleton className="h-10 w-full sm:h-9 sm:max-w-xs" rounded="lg" />

      {/* Mobile: two equal chips */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {Array.from({ length: mobileCount }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" rounded="lg" />
        ))}
      </div>

      {/* Desktop: full control row (unchanged) */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {Array.from({ length: controls }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9"
            rounded="lg"
            style={{ width: i === controls - 1 ? 88 : 132 }}
          />
        ))}
      </div>
    </div>
  );
};

export const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonPanel key={i} className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <Skeleton className="h-3 w-20 sm:w-24" rounded="md" />
          <Skeleton className="h-8 w-8" rounded="xl" />
        </div>
        <Skeleton className="h-7 w-14 sm:h-8 sm:w-16" rounded="md" />
        <Skeleton className="mt-2 h-3 w-24 sm:w-28" rounded="md" />
      </SkeletonPanel>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <SkeletonPanel className="space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-4 w-24" rounded="md" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" rounded="lg" />
        <Skeleton className="h-8 w-16" rounded="lg" />
        <Skeleton className="h-8 w-16" rounded="lg" />
      </div>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" rounded="md" />
        <Skeleton className="h-8 w-20 sm:h-9 sm:w-24" rounded="md" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
        <Skeleton className="h-10 w-full sm:h-9 sm:w-36" rounded="lg" />
        <Skeleton className="h-10 w-full sm:h-9 sm:w-24" rounded="lg" />
      </div>
    </div>
    <div
      className="relative h-40 w-full overflow-hidden rounded-xl sm:h-52"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      <div className="absolute inset-x-3 bottom-3 flex h-28 items-end gap-1.5 sm:inset-x-4 sm:bottom-4 sm:h-36 sm:gap-2">
        {[40, 65, 45, 80, 55, 70, 50, 75, 60, 85, 48, 72].map((h, i) => (
          <Skeleton
            key={i}
            className={`flex-1 ${i >= 6 ? 'hidden sm:block' : ''}`}
            rounded="md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  </SkeletonPanel>
);

export const RecentInquiriesSkeleton: React.FC = () => (
  <SkeletonPanel className="px-4 py-4 sm:px-5 sm:py-5 lg:col-span-2">
    <div className="mb-3 flex items-center justify-between sm:mb-4">
      <Skeleton className="h-4 w-28 sm:w-32" rounded="md" />
      <Skeleton className="h-4 w-14 sm:w-16" rounded="md" />
    </div>
    <ul>
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className={`flex items-start gap-3 py-3 sm:py-3.5 ${i >= 3 ? 'hidden sm:flex' : ''}`}
          style={{ borderTop: i === 0 ? undefined : '1px solid #F5F5F4' }}
        >
          <SkeletonCircle size={36} />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-3.5 w-24 sm:w-28" rounded="md" />
              <Skeleton className="h-3 w-10" rounded="md" />
            </div>
            <Skeleton className="h-3 w-3/4 max-w-[240px]" rounded="md" />
          </div>
        </li>
      ))}
    </ul>
  </SkeletonPanel>
);

export const DemandSkeleton: React.FC = () => (
  <SkeletonPanel className="px-4 py-4 sm:px-5 sm:py-5">
    <Skeleton className="h-4 w-20" rounded="md" />
    <Skeleton className="mt-2 h-3 w-36 sm:w-40" rounded="md" />
    <div className="mt-5 space-y-4 sm:mt-6">
      <div className="rounded-xl px-4 py-4" style={{ backgroundColor: '#FAF9F6' }}>
        <Skeleton className="h-3 w-16" rounded="md" />
        <Skeleton className="mt-2 h-4 w-32 sm:w-36" rounded="md" />
        <Skeleton className="mt-3 h-8 w-20" rounded="md" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <SkeletonText lines={1} className="flex-1" />
          <Skeleton className="h-3 w-10" rounded="md" />
        </div>
      ))}
    </div>
  </SkeletonPanel>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-5 sm:space-y-6" aria-busy="true" aria-label="Loading dashboard">
    <MetricsSkeleton />
    <ChartSkeleton />
    <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
      <RecentInquiriesSkeleton />
      <DemandSkeleton />
    </div>
  </div>
);

export const KanbanSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <div
    className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:mx-0 sm:gap-4 sm:snap-none sm:px-0"
    aria-busy="true"
    aria-label="Loading board"
  >
    {Array.from({ length: columns }).map((_, col) => (
      <div
        key={col}
        className="w-[16.5rem] shrink-0 snap-start rounded-2xl border p-3 sm:w-72"
        style={{ backgroundColor: '#FAF9F6', borderColor: '#E7E5E4' }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <Skeleton className="h-3.5 w-24" rounded="md" />
          <Skeleton className="h-5 w-7" rounded="full" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: col === 0 ? 3 : col === 1 ? 2 : 1 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2.5 rounded-xl border p-3.5"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
            >
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-3.5 w-28" rounded="md" />
                <Skeleton className="h-5 w-5" rounded="md" />
              </div>
              <Skeleton className="h-3 w-24" rounded="md" />
              <Skeleton className="h-3 w-36" rounded="md" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-3 w-16" rounded="md" />
                <Skeleton className="h-3 w-10" rounded="md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  /** Optional trailing action column width hint */
  withActions?: boolean;
  /** Skip outer card chrome when nested in another panel */
  bare?: boolean;
}> = ({ rows = 6, columns = 6, withActions = true, bare = false }) => {
  const cols = Math.max(2, columns);
  const mobileRows = Math.min(rows, 5);

  const mobileCards = (
    <div className="space-y-2.5 sm:hidden" aria-busy aria-label="Loading table">
      {Array.from({ length: mobileRows }).map((_, i) => (
        <div
          key={i}
          className="space-y-2.5 rounded-xl border p-3.5"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-3.5 w-32" rounded="md" />
            <Skeleton className="h-5 w-14" rounded="full" />
          </div>
          <Skeleton className="h-3 w-40" rounded="md" />
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <Skeleton className="h-3 w-24" rounded="md" />
            {withActions ? <Skeleton className="h-3 w-12" rounded="md" /> : null}
          </div>
        </div>
      ))}
    </div>
  );

  const body = (
    <>
      <div
        className="grid gap-4 border-b px-4 py-3"
        style={{
          borderColor: '#E7E5E4',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3"
            rounded="md"
            style={{
              width: withActions && i === cols - 1 ? 40 : 64,
              marginLeft: withActions && i === cols - 1 ? 'auto' : undefined,
            }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 border-b px-4 py-3.5 last:border-b-0"
          style={{
            borderColor: '#F5F5F4',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={c === cols - 2 && cols > 3 ? 'h-5 w-16' : 'h-3.5'}
              rounded={c === cols - 2 && cols > 3 ? 'full' : 'md'}
              style={{
                width:
                  withActions && c === cols - 1
                    ? 56
                    : c === 0
                      ? 96
                      : c === 1
                        ? 112
                        : 80,
                marginLeft: withActions && c === cols - 1 ? 'auto' : undefined,
              }}
            />
          ))}
        </div>
      ))}
    </>
  );

  if (bare) {
    return (
      <>
        {mobileCards}
        <div
          className="hidden overflow-hidden rounded-xl border sm:block"
          style={{ borderColor: '#F5F5F4' }}
          aria-busy
          aria-label="Loading table"
        >
          {body}
        </div>
      </>
    );
  }

  return (
    <>
      {mobileCards}
      <SkeletonPanel
        className="hidden overflow-hidden sm:block"
        aria-busy
        aria-label="Loading table"
      >
        {body}
      </SkeletonPanel>
    </>
  );
};

export const InquiriesPageSkeleton: React.FC<{ viewMode?: 'kanban' | 'table' }> = ({
  viewMode = 'kanban',
}) => (
  <div className="space-y-4 sm:space-y-5" aria-busy="true" aria-label="Loading service inquiries">
    <PageHeaderSkeleton />
    <ToolbarSkeleton controls={4} />
    {viewMode === 'kanban' ? <KanbanSkeleton /> : <TableSkeleton rows={8} columns={6} />}
  </div>
);

export const ArchivesPageSkeleton: React.FC = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading archives">
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-5 w-28" rounded="md" />
        <Skeleton className="h-3 w-8" rounded="md" />
      </div>
      <Skeleton className="h-10 w-full sm:h-9 sm:w-64" rounded="lg" />
    </div>
    <TableSkeleton rows={7} columns={6} />
  </div>
);

export const OrphansPageSkeleton: React.FC = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading off-pipeline inquiries">
    <PageHeaderSkeleton withSubtitle />
    <SkeletonPanel className="px-3.5 py-3 sm:px-4">
      <Skeleton className="h-3.5 w-full max-w-xl" rounded="md" />
    </SkeletonPanel>
    <TableSkeleton rows={5} columns={5} />
  </div>
);

export const TeamSectionSkeleton: React.FC = () => (
  <SkeletonPanel className="overflow-hidden">
    <div
      className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      style={{ borderColor: '#F5F5F4', backgroundColor: '#FAFAF9' }}
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" rounded="md" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16" rounded="md" />
          <Skeleton className="h-3 w-32" rounded="md" />
        </div>
      </div>
      <Skeleton className="h-10 w-full sm:w-28" rounded="lg" />
    </div>
    <div className="px-4 py-4 sm:px-5">
      <TableSkeleton rows={4} columns={4} bare />
    </div>
  </SkeletonPanel>
);

export const SettingsPageSkeleton: React.FC = () => (
  <div className="space-y-4 sm:space-y-5" aria-busy="true" aria-label="Loading settings">
    <PageHeaderSkeleton />
    <SkeletonPanel className="px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-10 w-10 shrink-0" rounded="xl" />
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-2.5 w-20" rounded="md" />
            <Skeleton className="h-4 w-32 sm:w-36" rounded="md" />
            <Skeleton className="h-3 w-40 sm:w-44" rounded="md" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Skeleton className="h-10 w-full sm:w-28" rounded="lg" />
          <Skeleton className="h-10 w-full sm:w-36" rounded="lg" />
        </div>
      </div>
    </SkeletonPanel>
    <SkeletonPanel className="space-y-3.5 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" rounded="md" />
          <Skeleton className="h-3 w-48 sm:w-56" rounded="md" />
        </div>
        <Skeleton className="h-3 w-24" rounded="md" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-10 w-[calc(50%-0.25rem)] sm:w-24 ${i >= 4 ? 'hidden sm:block' : ''}`}
            rounded="lg"
          />
        ))}
      </div>
      <div className="flex items-end gap-2 pt-1">
        <Skeleton className="h-10 w-[7.5rem]" rounded="lg" />
        <Skeleton className="h-10 w-16" rounded="lg" />
      </div>
    </SkeletonPanel>
    <TeamSectionSkeleton />
  </div>
);

/** Full CRM chrome while session is verified. */
export const AppShellSkeleton: React.FC = () => (
  <div
    className="flex min-h-screen min-h-dvh"
    style={{ backgroundColor: '#F7F5F1' }}
    aria-busy="true"
    aria-label="Loading workspace"
  >
    <aside
      className="hidden w-64 shrink-0 border-r lg:flex lg:flex-col"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
    >
      <div className="flex items-center gap-2.5 border-b px-5 py-4" style={{ borderColor: '#E7E5E4' }}>
        <Skeleton className="h-9 w-9" rounded="xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" rounded="md" />
          <Skeleton className="h-2.5 w-16" rounded="md" />
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" rounded="xl" />
        ))}
      </nav>
      <div className="border-t p-4" style={{ borderColor: '#E7E5E4' }}>
        <Skeleton className="h-14 w-full" rounded="xl" />
      </div>
    </aside>

    <div className="flex min-w-0 flex-1 flex-col">
      {/* Matches Header: menu (mobile) + create lead */}
      <header
        className="flex h-16 items-center justify-between border-b px-3 sm:px-6 lg:px-8"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
      >
        <Skeleton className="h-9 w-9 rounded-xl lg:hidden" rounded="xl" />
        <div className="ml-auto">
          <Skeleton className="h-9 w-9 sm:w-[7.75rem]" rounded="full" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-5 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </main>
    </div>
  </div>
);
