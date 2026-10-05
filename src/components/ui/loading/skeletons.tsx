'use client';

import React from 'react';
import { Skeleton, SkeletonCircle, SkeletonText, SkeletonPanel } from './Skeleton';

export const PageHeaderSkeleton: React.FC<{
  withSubtitle?: boolean;
  withAction?: boolean;
}> = ({ withSubtitle = true, withAction = false }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="space-y-2">
      <Skeleton className="h-5 w-40" rounded="md" />
      {withSubtitle ? <Skeleton className="h-3.5 w-56" rounded="md" /> : null}
    </div>
    {withAction ? <Skeleton className="h-9 w-40" rounded="lg" /> : null}
  </div>
);

export const ToolbarSkeleton: React.FC<{ controls?: number }> = ({ controls = 4 }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <Skeleton className="h-9 w-full sm:max-w-xs" rounded="lg" />
    <div className="flex flex-wrap items-center gap-2">
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

export const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonPanel key={i} className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-3 w-24" rounded="md" />
          <Skeleton className="h-8 w-8" rounded="xl" />
        </div>
        <Skeleton className="h-8 w-16" rounded="md" />
        <Skeleton className="mt-2 h-3 w-28" rounded="md" />
      </SkeletonPanel>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <SkeletonPanel className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
    <div className="flex items-center justify-between gap-3">
      <Skeleton className="h-4 w-24" rounded="md" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" rounded="lg" />
        <Skeleton className="h-8 w-16" rounded="lg" />
        <Skeleton className="h-8 w-16" rounded="lg" />
      </div>
    </div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" rounded="md" />
        <Skeleton className="h-9 w-24" rounded="md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-36" rounded="lg" />
        <Skeleton className="h-9 w-24" rounded="lg" />
      </div>
    </div>
    <div
      className="relative h-52 w-full overflow-hidden rounded-xl"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      <div className="absolute inset-x-4 bottom-4 flex h-36 items-end gap-2">
        {[40, 65, 45, 80, 55, 70, 50, 75, 60, 85, 48, 72].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            rounded="md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  </SkeletonPanel>
);

export const RecentInquiriesSkeleton: React.FC = () => (
  <SkeletonPanel className="lg:col-span-2 px-5 py-5">
    <div className="mb-4 flex items-center justify-between">
      <Skeleton className="h-4 w-32" rounded="md" />
      <Skeleton className="h-4 w-16" rounded="md" />
    </div>
    <ul>
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="flex items-start gap-3 py-3.5"
          style={{ borderTop: i === 0 ? undefined : '1px solid #F5F5F4' }}
        >
          <SkeletonCircle size={36} />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-3.5 w-28" rounded="md" />
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
  <SkeletonPanel className="px-5 py-5">
    <Skeleton className="h-4 w-20" rounded="md" />
    <Skeleton className="mt-2 h-3 w-40" rounded="md" />
    <div className="mt-6 space-y-4">
      <div className="rounded-xl px-4 py-4" style={{ backgroundColor: '#FAF9F6' }}>
        <Skeleton className="h-3 w-16" rounded="md" />
        <Skeleton className="mt-2 h-4 w-36" rounded="md" />
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
  <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
    <MetricsSkeleton />
    <ChartSkeleton />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <RecentInquiriesSkeleton />
      <DemandSkeleton />
    </div>
  </div>
);

export const KanbanSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <div
    className="flex gap-4 overflow-x-auto pb-2"
    aria-busy="true"
    aria-label="Loading board"
  >
    {Array.from({ length: columns }).map((_, col) => (
      <div
        key={col}
        className="w-72 shrink-0 rounded-2xl border p-3"
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
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: '#F5F5F4' }}
        aria-busy
        aria-label="Loading table"
      >
        {body}
      </div>
    );
  }

  return (
    <SkeletonPanel className="overflow-hidden" aria-busy aria-label="Loading table">
      {body}
    </SkeletonPanel>
  );
};

export const InquiriesPageSkeleton: React.FC<{ viewMode?: 'kanban' | 'table' }> = ({
  viewMode = 'kanban',
}) => (
  <div className="space-y-5" aria-busy="true" aria-label="Loading service inquiries">
    <PageHeaderSkeleton />
    <ToolbarSkeleton controls={4} />
    {viewMode === 'kanban' ? <KanbanSkeleton /> : <TableSkeleton rows={8} columns={6} />}
  </div>
);

export const ArchivesPageSkeleton: React.FC = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading archives">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-5 w-28" rounded="md" />
        <Skeleton className="h-3 w-8" rounded="md" />
      </div>
      <Skeleton className="h-9 w-full sm:w-64" rounded="lg" />
    </div>
    <TableSkeleton rows={7} columns={6} />
  </div>
);

export const OrphansPageSkeleton: React.FC = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading off-pipeline inquiries">
    <PageHeaderSkeleton withSubtitle />
    <SkeletonPanel className="px-4 py-3">
      <Skeleton className="h-3.5 w-full max-w-xl" rounded="md" />
    </SkeletonPanel>
    <TableSkeleton rows={5} columns={5} />
  </div>
);

export const TeamSectionSkeleton: React.FC = () => (
  <SkeletonPanel className="overflow-hidden">
    <div
      className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: '#F5F5F4', backgroundColor: '#FAFAF9' }}
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" rounded="md" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16" rounded="md" />
          <Skeleton className="h-3 w-32" rounded="md" />
        </div>
      </div>
      <Skeleton className="h-10 w-28" rounded="lg" />
    </div>
    <div className="px-5 py-4">
      <TableSkeleton rows={4} columns={4} bare />
    </div>
  </SkeletonPanel>
);

export const SettingsPageSkeleton: React.FC = () => (
  <div className="space-y-5" aria-busy="true" aria-label="Loading settings">
    <PageHeaderSkeleton />
    <SkeletonPanel className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-10 w-10" rounded="xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-20" rounded="md" />
            <Skeleton className="h-4 w-36" rounded="md" />
            <Skeleton className="h-3 w-44" rounded="md" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" rounded="lg" />
          <Skeleton className="h-10 w-36" rounded="lg" />
        </div>
      </div>
    </SkeletonPanel>
    <SkeletonPanel className="space-y-3.5 px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" rounded="md" />
          <Skeleton className="h-3 w-56" rounded="md" />
        </div>
        <Skeleton className="h-3 w-24" rounded="md" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" rounded="lg" />
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
    className="flex min-h-screen"
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
      <header
        className="flex h-14 items-center justify-between border-b px-4 sm:px-6"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
      >
        <Skeleton className="h-4 w-32" rounded="md" />
        <Skeleton className="h-9 w-28" rounded="lg" />
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </main>
    </div>
  </div>
);
