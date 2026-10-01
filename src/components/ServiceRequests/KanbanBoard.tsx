'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { ConfirmModal } from '../ui/ConfirmModal';
import { Spinner, LoadingOverlay } from '../ui/loading';
import { GripVertical, Trash2, AlertTriangle, X } from 'lucide-react';

interface KanbanBoardProps {
  requests: ServiceRequest[];
  onSelectRequest: (req: ServiceRequest) => void;
  onKanbanSync: (
    next: ServiceRequest[],
    previous: ServiceRequest[]
  ) => Promise<boolean>;
  onDeleteRequest?: (id: string) => void;
}

const COLUMNS: { id: RequestStatus; title: string }[] = [
  { id: 'Pending', title: 'Pending' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Resolved', title: 'Resolved' },
];

const COLUMN_IDS = new Set<string>(COLUMNS.map((c) => c.id));

const PRIORITY_DOT: Record<RequestPriority, string> = {
  High: '#E02126',
  Medium: '#D97706',
  Low: '#A8A29E',
};

type ConfirmState = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
};

type ItemsState = Record<RequestStatus, string[]>;

function clientNameOf(req: ServiceRequest) {
  return req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client';
}

function buildItems(requests: ServiceRequest[]): ItemsState {
  const items: ItemsState = {
    Pending: [],
    'In Progress': [],
    Resolved: [],
    Archived: [],
  };
  const sorted = [...requests].sort(sortByBoardOrder);
  for (const req of sorted) {
    if (req.status === 'Archived') continue;
    if (items[req.status]) items[req.status].push(req.id);
    else items.Pending.push(req.id);
  }
  return items;
}

function findContainer(items: ItemsState, id: UniqueIdentifier): RequestStatus | null {
  const sid = String(id);
  if (COLUMN_IDS.has(sid)) return sid as RequestStatus;
  for (const col of COLUMNS) {
    if (items[col.id].includes(sid)) return col.id;
  }
  return null;
}

function itemsToRequests(
  items: ItemsState,
  byId: Map<string, ServiceRequest>
): ServiceRequest[] {
  const next: ServiceRequest[] = [];
  for (const col of COLUMNS) {
    items[col.id].forEach((id, index) => {
      const base = byId.get(id);
      if (!base) return;
      next.push({ ...base, status: col.id, boardOrder: index });
    });
  }
  // keep archived / unknown
  for (const req of byId.values()) {
    if (req.status === 'Archived' || !COLUMN_IDS.has(req.status)) {
      if (!next.some((r) => r.id === req.id)) next.push(req);
    }
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
        backgroundColor: '#FAF9F6',
        borderColor: isDragging ? '#E02126' : '#E7E5E4',
        opacity: isDragging && !isOverlay ? 0.35 : 1,
        boxShadow: isOverlay ? '0 12px 32px rgba(28,25,23,0.18)' : undefined,
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
                title: 'Delete inquiry?',
                message: `Archive the inquiry from ${clientName}.`,
                confirmText: 'Delete',
                variant: 'danger',
                onConfirm: () => onDeleteRequest(req.id),
              });
            }}
            className="p-1 rounded-md cursor-pointer shrink-0"
            style={{ color: '#B91C1C' }}
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
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

      <div className="pl-7 flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: PRIORITY_DOT[req.priority] }}
        />
        <span className="text-[11px] font-medium" style={{ color: '#78716C' }}>
          {req.priority} priority
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
      className="flex flex-col rounded-2xl border min-h-[20rem]"
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
            <p
              className="py-8 text-center text-xs rounded-xl border border-dashed"
              style={{ color: '#D6D3D1', borderColor: isOver ? '#FECACA' : '#E7E5E4' }}
            >
              {isOver ? 'Drop here' : 'No inquiries'}
            </p>
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
  onSelectRequest,
  onKanbanSync,
  onDeleteRequest,
}) => {
  const [items, setItems] = useState<ItemsState>(() => buildItems(requests));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmState | null>(null);

  useEffect(() => {
    setItems(buildItems(requests));
  }, [requests]);

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
  const overColumnId = activeId ? findContainer(items, activeId) : null;

  const persistItems = async (nextItems: ItemsState, previousRequests: ServiceRequest[]) => {
    const nextRequests = itemsToRequests(nextItems, byId);
    setIsSyncing(true);
    setSyncError(null);
    const ok = await onKanbanSync(nextRequests, previousRequests);
    setIsSyncing(false);
    if (!ok) {
      setItems(buildItems(previousRequests));
      setSyncError('Could not save board changes. Your last move was reverted.');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setSyncError(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(items, active.id);
    const overContainer = findContainer(items, over.id);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setItems((prev) => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.indexOf(String(active.id));
      if (activeIndex === -1) return prev;

      let newIndex: number;
      if (COLUMN_IDS.has(String(over.id))) {
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
      setItems(buildItems(requests));
      return;
    }

    const activeContainer = findContainer(items, active.id);
    const overContainer = findContainer(items, over.id);
    if (!activeContainer || !overContainer) {
      setItems(buildItems(requests));
      return;
    }

    let nextItems = items;

    if (activeContainer === overContainer) {
      const colItems = [...items[activeContainer]];
      const oldIndex = colItems.indexOf(String(active.id));
      const newIndex = COLUMN_IDS.has(String(over.id))
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
    const projected = itemsToRequests(nextItems, byId);
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
    setItems(buildItems(requests));
  };

  return (
    <div className="relative space-y-3">
      <LoadingOverlay visible={isSyncing} label="Saving board…" />

      <div className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#A8A29E' }}>
        Drag cards to reorder or move between columns
        {isSyncing ? (
          <>
            <span>·</span>
            <Spinner size="xs" color="#A8A29E" />
            <span>Saving…</span>
          </>
        ) : null}
      </div>

      {syncError && (
        <div
          className="flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2', color: '#991B1B' }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="flex-1">{syncError}</span>
          <button
            type="button"
            onClick={() => setSyncError(null)}
            className="shrink-0 cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              ids={items[column.id]}
              byId={byId}
              isOver={Boolean(activeId && overColumnId === column.id && findContainer(items, activeId) !== column.id)}
              onSelectRequest={onSelectRequest}
              onDeleteRequest={onDeleteRequest}
              setConfirmAction={setConfirmAction}
            />
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
