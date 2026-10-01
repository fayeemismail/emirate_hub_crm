'use client';

import React from 'react';
import { Skeleton, SkeletonCircle, SkeletonText } from './Skeleton';

export const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border p-5"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-3 w-24" rounded="md" />
          <Skeleton className="h-8 w-8" rounded="xl" />
        </div>
        <Skeleton className="h-8 w-16" rounded="md" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div
    className="space-y-6 rounded-2xl border px-5 py-5 sm:px-6 sm:py-6"
    style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
  >
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" rounded="md" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" rounded="lg" />
        <Skeleton className="h-8 w-16" rounded="lg" />
        <Skeleton className="h-8 w-16" rounded="lg" />
      </div>
    </div>
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" rounded="md" />
        <Skeleton className="h-9 w-20" rounded="md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-36" rounded="lg" />
        <Skeleton className="h-9 w-24" rounded="lg" />
      </div>
    </div>
    <div className="relative h-48 w-full overflow-hidden rounded-xl" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="absolute inset-x-4 bottom-4 flex h-32 items-end gap-2">
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
  </div>
);

export const RecentInquiriesSkeleton: React.FC = () => (
  <div
    className="lg:col-span-2 rounded-2xl border px-5 py-5"
    style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
  >
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
  </div>
);

export const DemandSkeleton: React.FC = () => (
  <div
    className="rounded-2xl border px-5 py-5"
    style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
  >
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
  </div>
);

export const KanbanSkeleton: React.FC = () => (
  <div className="flex gap-4 overflow-x-auto pb-2">
    {Array.from({ length: 3 }).map((_, col) => (
      <div
        key={col}
        className="w-72 shrink-0 rounded-2xl border p-3"
        style={{ backgroundColor: '#FAF9F6', borderColor: '#E7E5E4' }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <Skeleton className="h-3.5 w-20" rounded="md" />
          <Skeleton className="h-5 w-6" rounded="full" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: col === 0 ? 3 : 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border p-3.5 space-y-2.5"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
            >
              <Skeleton className="h-3.5 w-32" rounded="md" />
              <Skeleton className="h-3 w-24" rounded="md" />
              <SkeletonText lines={2} />
              <Skeleton className="h-3 w-20" rounded="md" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div
    className="overflow-hidden rounded-2xl border"
    style={{ backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }}
  >
    <div
      className="grid grid-cols-6 gap-4 border-b px-4 py-3"
      style={{ borderColor: '#E7E5E4' }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-16" rounded="md" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="grid grid-cols-6 gap-4 border-b px-4 py-3.5 last:border-b-0"
        style={{ borderColor: '#F5F5F4' }}
      >
        <Skeleton className="h-3.5 w-24" rounded="md" />
        <Skeleton className="h-3.5 w-28" rounded="md" />
        <Skeleton className="h-3.5 w-20" rounded="md" />
        <Skeleton className="h-3.5 w-24" rounded="md" />
        <Skeleton className="h-5 w-16" rounded="full" />
        <Skeleton className="h-3.5 w-14" rounded="md" />
      </div>
    ))}
  </div>
);
