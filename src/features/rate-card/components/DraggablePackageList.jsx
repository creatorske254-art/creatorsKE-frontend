import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import PackageCard from './PackageCard';
import { IconPlus } from '@tabler/icons-react';

// ─── Sortable item wrapper ────────────────────────────────────────────────────
function SortablePackageCard({ pkg, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pkg.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PackageCard
        pkg={pkg}
        isActive={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

// ─── DraggablePackageList ─────────────────────────────────────────────────────
/**
 * Props:
 *   packages   - array of package objects (must have .id)
 *   onChange   - (newOrder: string[]) => void  - called on drag end with new id order
 *   onEdit     - (pkg) => void
 *   onDelete   - (pkg) => void
 *   onAddNew   - () => void
 */
export default function DraggablePackageList({ packages = [], onChange, onEdit, onDelete, onAddNew }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // prevents accidental drags on click
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activePackage = packages.find((p) => p.id === activeId);

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = packages.findIndex((p) => p.id === active.id);
    const newIndex = packages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(packages, oldIndex, newIndex);
    onChange?.(reordered.map((p) => p.id));
  }

  return (
    <div className="draggable-list">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={packages.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="draggable-list__items">
            {packages.map((pkg) => (
              <SortablePackageCard
                key={pkg.id}
                pkg={pkg}
                onEdit={() => onEdit?.(pkg)}
                onDelete={() => onDelete?.(pkg)}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay - the floating card while dragging */}
        <DragOverlay dropAnimation={null}>
          {activePackage ? (
            <PackageCard
              pkg={activePackage}
              isActive
              dragHandleProps={{}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add package CTA */}
      <button
        type="button"
        className="draggable-list__add"
        onClick={onAddNew}
      >
        <IconPlus className="icon-lg" aria-hidden="true" />
        Add package
      </button>

      <style>{`
        .draggable-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .draggable-list__items {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .draggable-list__add {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-8);
          width: 100%;
          padding: var(--space-20);
          background: var(--white);
          border: 1.5px dashed var(--grey-200);
          border-radius: var(--radius-lg);
          color: var(--grey-500);
          font-size: 14px;
          font-weight: 500;
          font-family: var(--font-body);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          margin-top: var(--space-4);
        }
        .draggable-list__add:hover {
          border-color: var(--purple-300);
          color: var(--purple-600);
          background: var(--purple-50);
        }
      `}</style>
    </div>
  );
}
