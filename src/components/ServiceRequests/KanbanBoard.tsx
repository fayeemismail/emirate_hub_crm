'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ServiceRequest, RequestStatus, RequestPriority } from '../../types';
import { sortByBoardOrder } from '../../lib/adapters';
import { daysInStage, formatStageAge, isStaleInStage } from '../../lib/stageAge';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Spinner } from '../ui/loading';
import { EmptyState } from '../ui/EmptyState';
import { GripVertical, Archive, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  ARCHIVE_CONFIRM_BUTTON,
  ARCHIVE_CONFIRM_TITLE,
  archiveConfirmMessage,
} from '../../lib/archiveCopy';

interface KanbanColumn {
  id: RequestStatus;
  title: string;
}

interface KanbanBoardProps {
  requests: ServiceRequest[];
  columns: KanbanColumn[];
  onSelectRequest: (req: ServiceRequest) => void;
  onKanbanSync: (
    next: ServiceRequest[],
    previous: ServiceRequest[]
  ) => Promise<boolean>;
  onDeleteRequest?: (id: string) => void;
}

const PRIORITY_DOT: Record<RequestPriority, string> = {
  High: '#E02126',
  Medium: '#D97706',
  Low: '#A8A29E',
};

/** @deprecated kept only so old imports don't break; orphans are listed off-board now. */
export const UNKNOWN_STATUS_COLUMN_ID = '__unknown__';

type ConfirmState = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
};

type ItemsState = Record<string, string[]>;

function clientNameOf(req: ServiceRequest) {
  return req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client';
}

function buildItems(requests: ServiceRequest[], columns: KanbanColumn[]): ItemsState {
  const items: ItemsState = {};
  for (const col of columns) items[col.id] = [];
  const columnIds = new Set(columns.map((c) => c.id));
  const sorted = [...requests].sort(sortByBoardOrder);
  for (const req of sorted) {
    if (columnIds.has(req.status)) items[req.status].push(req.id);
    // Orphans stay off the board — listed on the Off-pipeline nav page.
  }
  return items;
}

function findContainer(
  items: ItemsState,
  columns: KanbanColumn[],
  id: UniqueIdentifier
): RequestStatus | null {
  const sid = String(id);
  const columnIds = new Set(columns.map((c) => c.id));
  if (columnIds.has(sid)) return sid;
  for (const col of columns) {
    if (items[col.id]?.includes(sid)) return col.id;
  }
  return null;
}

function itemsToRequests(
  items: ItemsState,
  columns: KanbanColumn[],
  byId: Map<string, ServiceRequest>
): ServiceRequest[] {
  const next: ServiceRequest[] = [];
  const seen = new Set<string>();

  for (const col of columns) {
    (items[col.id] || []).forEach((id, index) => {
      const base = byId.get(id);
      if (!base) return;
      seen.add(id);
      next.push({ ...base, status: col.id, boardOrder: index });
    });
  }

  // Preserve orphans untouched (not on board).
  for (const req of byId.values()) {
    if (!seen.has(req.id)) next.push(req);
  }
  return next;
}

function CardChrome({
  req,
  onSelectRequest,
  onDeleteRequest,
  setConfirmAction,
  dragHandleProps,
  isDragging,
  isOverlay,
}: {
  req: ServiceRequest;
  onSelectRequest: (req: ServiceRequest) => void;
  onDeleteRequest?: (id: string) => void;
  setConfirmAction: (v: ConfirmState | null) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isOverlay?: boolean;
}) {
  const clientName = clientNameOf(req);
  const ageDays = daysInStage(req.statusChangedAt, req.createdAt);
  const stale = isStaleInStage(ageDays);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectRequest(req)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectRequest(req);
        }
      }}
      className="rounded-xl border p-3 text-left cursor-pointer space-y-2.5"
      style={{
        backgroundColor: stale ? '#FFFBEB' : '#FAF9F6',
        borderColor: isDragging ? '#E02126' : stale ? '#FDE68A' : '#E7E5E4',
        boxShadow: isOverlay
          ? '0 12px 32px rgba(28,25,23,0.18)'
          : stale
            ? 'inset 3px 0 0 #D97706'
            : undefined,
        opacity: isDragging && !isOverlay ? 0.35 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <button
            type="button"
            {...dragHandleProps}
            className="mt-0.5 p-1 -ml-1 rounded-md cursor-grab active:cursor-grabbing shrink-0 touch-none"
            style={{ color: '#A8A29E' }}
            title="Drag card"
            aria-label="Drag card"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="font-medium truncate text-sm" style={{ color: '#1C1917' }}>
              {clientName}
            </p>
            <p className="mt-0.5 truncate text-xs" style={{ color: '#78716C' }}>
              {req.service}
            </p>
          </div>
        </div>

        {onDeleteRequest && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmAction({
                isOpen: true,
                title: ARCHIVE_CONFIRM_TITLE,
                message: archiveConfirmMessage(clientName),
                confirmText: ARCHIVE_CONFIRM_BUTTON,
                variant: 'danger',
                onConfirm: () => onDeleteRequest(req.id),
              });
            }}
            className="p-1 rounded-md cursor-pointer shrink-0"
            style={{ color: '#B91C1C' }}
            aria-label="Archive inquiry"
            title="Archive"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="pl-7 space-y-1 text-xs">
        <p className="truncate" style={{ color: '#78716C' }}>
          <span style={{ color: '#A8A29E' }}>Email </span>
          {req.email}
        </p>
        <p className="truncate" style={{ color: '#78716C' }}>
          <span style={{ color: '#A8A29E' }}>Phone </span>
          {req.phone || 'Not provided'}
        </p>
      </div>

      <div className="pl-7 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ backgroundColor: PRIORITY_DOT[req.priority] }}
          />
          <span className="text-[11px] font-medium truncate" style={{ color: '#78716C' }}>
            {req.priority} priority
          </span>
        </div>
        <span
          className="text-[11px] font-medium tabular-nums shrink-0"
          style={{ color: stale ? '#B45309' : '#A8A29E' }}
          title="Time in current stage"
        >
          {formatStageAge(ageDays)}
        </span>
      </div>
    </div>
  );
}

function SortableCard(props: {
  req: ServiceRequest;
  onSelectRequest: (req: ServiceRequest) => void;
  onDeleteRequest?: (id: string) => void;
  setConfirmAction: (v: ConfirmState | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.req.id,
    data: { type: 'card', status: props.req.status },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CardChrome
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

function Column({
  column,
  ids,
  byId,
  isOver,
  onSelectRequest,
  onDeleteRequest,
  setConfirmAction,
}: {
  column: { id: RequestStatus; title: string };
  ids: string[];
  byId: Map<string, ServiceRequest>;
  isOver: boolean;
  onSelectRequest: (req: ServiceRequest) => void;
  onDeleteRequest?: (id: string) => void;
  setConfirmAction: (v: ConfirmState | null) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      className="flex flex-col w-full rounded-2xl border min-h-[20rem]"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: isOver ? '#E02126' : '#E7E5E4',
      }}
    >
      <div className="flex items-baseline justify-between gap-2 px-4 pt-4 pb-2 shrink-0">
        <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
          {column.title}
        </h3>
        <span className="text-sm tabular-nums" style={{ color: '#A8A29E' }}>
          {ids.length}
        </span>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-1 px-3 pb-4 space-y-3 min-h-[12rem]">
          {ids.length === 0 && (
            <div
              className="rounded-xl border border-dashed"
              style={{ borderColor: isOver ? '#FECACA' : '#E7E5E4' }}
            >
              <EmptyState
                compact
                icon="inbox"
                title={isOver ? 'Drop here' : 'No inquiries'}
                description={isOver ? undefined : 'Drag a card into this stage.'}
              />
            </div>
          )}

          {ids.map((id) => {
            const req = byId.get(id);
            if (!req) return null;
            return (
              <SortableCard
                key={id}
                req={req}
                onSelectRequest={onSelectRequest}
                onDeleteRequest={onDeleteRequest}
                setConfirmAction={setConfirmAction}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  requests,
  columns,
  onSelectRequest,
  onKanbanSync,
  onDeleteRequest,
}) => {
  const columnIds = useMemo(() => new Set(columns.map((c) => c.id)), [columns]);
  const [items, setItems] = useState<ItemsState>(() => buildItems(requests, columns));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmState | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(buildItems(requests, columns));
  }, [requests, columns]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, ServiceRequest>();
    for (const req of requests) map.set(req.id, req);
    return map;
  }, [requests]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const activeRequest = activeId ? byId.get(activeId) ?? null : null;
  const overColumnId = activeId ? findContainer(items, columns, activeId) : null;

  if (columns.length === 0) {
    return (
      <EmptyState
        icon="pipeline"
        title="No pipeline columns"
        description="Statuses from Sanity will appear here as board columns once they’re published."
      />
    );
  }

  const showSuccess = (message: string) => {
    setSyncSuccess(message);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
      setSyncSuccess(null);
      successTimerRef.current = null;
    }, 2800);
  };

  const persistItems = async (
    nextItems: ItemsState,
    previousRequests: ServiceRequest[]
  ) => {
    const nextRequests = itemsToRequests(nextItems, columns, byId);
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const ok = await onKanbanSync(nextRequests, previousRequests);
      if (!ok) {
        setItems(buildItems(previousRequests, columns));
        setSyncError('Couldn’t save board changes. Your last move was reverted.');
        return;
      }
      const moved = nextRequests.find((n) => {
        const p = previousRequests.find((x) => x.id === n.id);
        return p && p.status !== n.status;
      });
      if (moved) {
        const colTitle = columns.find((c) => c.id === moved.status)?.title || moved.status;
        showSuccess(`Moved to ${colTitle}`);
      } else {
        showSuccess('Board order saved');
      }
    } catch {
      setItems(buildItems(previousRequests, columns));
      setSyncError('Couldn’t save board changes. Your last move was reverted.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setSyncError(null);
    setSyncSuccess(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(items, columns, active.id);
    const overContainer = findContainer(items, columns, over.id);
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setItems((prev) => {
      const activeItems = [...(prev[activeContainer] || [])];
      const overItems = [...(prev[overContainer] || [])];
      const activeIndex = activeItems.indexOf(String(active.id));
      if (activeIndex === -1) return prev;

      let newIndex: number;
      if (columnIds.has(String(over.id))) {
        newIndex = overItems.length;
      } else {
        const overIndex = overItems.indexOf(String(over.id));
        newIndex = overIndex >= 0 ? overIndex : overItems.length;
      }

      const movingId = String(active.id);
      const nextActive = activeItems.filter((id) => id !== movingId);
      const cleanedOver = overItems.filter((id) => id !== movingId);
      cleanedOver.splice(newIndex, 0, movingId);

      return {
        ...prev,
        [activeContainer]: nextActive,
        [overContainer]: cleanedOver,
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      setItems(buildItems(requests, columns));
      return;
    }

    const activeContainer = findContainer(items, columns, active.id);
    const overContainer = findContainer(items, columns, over.id);
    if (!activeContainer || !overContainer) {
      setItems(buildItems(requests, columns));
      return;
    }

    let nextItems = items;

    if (activeContainer === overContainer) {
      const colItems = [...(items[activeContainer] || [])];
      const oldIndex = colItems.indexOf(String(active.id));
      const newIndex = columnIds.has(String(over.id))
        ? colItems.length - 1
        : colItems.indexOf(String(over.id));

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        nextItems = {
          ...items,
          [activeContainer]: arrayMove(colItems, oldIndex, newIndex),
        };
        setItems(nextItems);
      }
    }

    const previous = requests;
    const projected = itemsToRequests(nextItems, columns, byId);
    const changed = projected.some((n) => {
      const p = previous.find((x) => x.id === n.id);
      return !p || p.status !== n.status || (p.boardOrder ?? 0) !== (n.boardOrder ?? 0);
    });

    if (changed) {
      await persistItems(nextItems, previous);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setItems(buildItems(requests, columns));
  };

  return (
    <div className="relative space-y-3">
      {/* Fixed-height status strip — swaps content in place so cards don’t jump */}
      <div
        className="flex min-h-[1.25rem] flex-wrap items-center gap-1.5 text-xs"
        style={{
          color: syncError
            ? '#B91C1C'
            : syncSuccess
              ? '#15803D'
              : '#A8A29E',
        }}
        role={syncError ? 'alert' : 'status'}
        aria-live="polite"
      >
        {isSyncing ? (
          <>
            <Spinner size="xs" color="#A8A29E" />
            <span>Saving…</span>
          </>
        ) : syncError ? (
          <>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 min-w-0">{syncError}</span>
            <button
              type="button"
              onClick={() => setSyncError(null)}
              className="shrink-0 cursor-pointer underline-offset-2 hover:underline"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </>
        ) : syncSuccess ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>{syncSuccess}</span>
          </>
        ) : (
          <span>Drag cards to reorder or move between columns</span>
        )}
      </div>

      <div
        className={isSyncing ? 'pointer-events-none opacity-70 transition-opacity' : ''}
        aria-busy={isSyncing}
      >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto md:overscroll-x-contain pb-1 items-stretch">
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-full md:flex-1 md:basis-64 md:min-w-64 md:shrink-0"
            >
              <Column
                column={column}
                ids={items[column.id] || []}
                byId={byId}
                isOver={Boolean(
                  activeId &&
                    overColumnId === column.id &&
                    findContainer(items, columns, activeId) !== column.id
                )}
                onSelectRequest={onSelectRequest}
                onDeleteRequest={onDeleteRequest}
                setConfirmAction={setConfirmAction}
              />
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeRequest ? (
            <div className="w-[min(100vw-2rem,20rem)] pointer-events-none">
              <CardChrome
                req={activeRequest}
                onSelectRequest={() => {}}
                setConfirmAction={() => {}}
                isOverlay
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      </div>

      {confirmAction && (
        <ConfirmModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          variant={confirmAction.variant}
        />
      )}
    </div>
  );
};
