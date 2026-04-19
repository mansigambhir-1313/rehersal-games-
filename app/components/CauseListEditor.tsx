"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { useCallback } from "react";

export type EditorItem = { id: string; text: string };

export function CauseListEditor({
  items,
  onChange,
  maxItems = 10,
  disabled,
}: {
  items: EditorItem[];
  onChange: (items: EditorItem[]) => void;
  maxItems?: number;
  disabled?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const oldIdx = items.findIndex((i) => i.id === active.id);
      const newIdx = items.findIndex((i) => i.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return;
      onChange(arrayMove(items, oldIdx, newIdx));
    },
    [items, onChange]
  );

  const updateText = (id: string, text: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, text } : i)));
  };

  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const addBlank = () => {
    if (items.length >= maxItems) return;
    onChange([
      ...items,
      { id: crypto.randomUUID(), text: "" },
    ]);
  };

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, idx) => (
            <CauseRow
              key={item.id}
              item={item}
              rank={idx + 1}
              onText={(t) => updateText(item.id, t)}
              onRemove={() => remove(item.id)}
              disabled={disabled}
            />
          ))}
        </SortableContext>
      </DndContext>

      {items.length < maxItems && !disabled && (
        <button
          type="button"
          onClick={addBlank}
          className="mt-1 self-start text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] transition-colors"
        >
          + add another cause ({items.length}/{maxItems})
        </button>
      )}
    </div>
  );
}

function CauseRow({
  item,
  rank,
  onText,
  onRemove,
  disabled,
}: {
  item: EditorItem;
  rank: number;
  onText: (t: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group bg-[color:var(--color-paper)] border border-[color:var(--color-divider)] rounded-[var(--radius-input)] pl-2 pr-2 py-1.5 hover:border-[color:var(--color-muted)] transition-colors"
    >
      <button
        type="button"
        aria-label={`Reorder cause ${rank}`}
        className="touch-none cursor-grab active:cursor-grabbing text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <span className="font-mono-num text-xs text-[color:var(--color-muted)] w-6 tabular-nums">
        {rank.toString().padStart(2, "0")}
      </span>
      <input
        type="text"
        value={item.text}
        onChange={(e) => onText(e.target.value)}
        placeholder="Type a cause you'd investigate…"
        disabled={disabled}
        maxLength={200}
        className="flex-1 bg-transparent outline-none text-[15px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)]/70"
      />
      <button
        type="button"
        aria-label="Remove"
        onClick={onRemove}
        disabled={disabled}
        className="text-[color:var(--color-muted)] hover:text-[color:var(--color-missed)] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
