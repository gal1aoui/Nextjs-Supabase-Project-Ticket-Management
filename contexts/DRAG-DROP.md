# Drag and Drop System

A lightweight, zero-dependency drag-and-drop system built on the native HTML5 Drag and Drop API.

## Features

- Zero external dependencies
- Three direction modes: `free`, `horizontal`, `vertical`
- Position detection: `before`, `after`, `inside`
- 8 color variants for drop indicators
- Type-safe with full TypeScript support
- React Context-based state management

## Quick Start

### 1. Wrap your component tree with the provider

```tsx
import { DragDropProvider } from "@/contexts/drag-drop-context";

function App() {
  return (
    <DragDropProvider direction="free">
      <YourComponents />
    </DragDropProvider>
  );
}
```

### 2. Make items draggable

```tsx
import { useDraggable } from "@/contexts/drag-drop-context";

function DraggableItem({ item }) {
  const { draggableProps } = useDraggable({
    type: "item",
    item: item,
    onDragStart: () => console.log("Started dragging"),
    onDragEnd: () => console.log("Finished dragging"),
  });

  return (
    <div {...draggableProps}>
      {item.name}
    </div>
  );
}
```

### 3. Create drop zones

```tsx
import { useDroppable } from "@/contexts/drag-drop-context";
import { DropIndicator } from "@/components/ui/drop-indicator";

function DropZone({ id, onItemDrop }) {
  const { isOver, dropPosition, direction, droppableProps } = useDroppable({
    id: id,
    accept: "item", // or ["item", "other-type"]
    onDrop: (item, position) => {
      onItemDrop(item, position);
    },
  });

  return (
    <div {...droppableProps} className="relative">
      <DropIndicator
        isOver={isOver}
        position={dropPosition}
        direction={direction}
        color="blue"
      />
      {/* Your content */}
    </div>
  );
}
```

## API Reference

### DragDropProvider

The context provider that manages drag-and-drop state.

```tsx
interface DragDropProviderProps {
  children: ReactNode;
  direction?: "free" | "horizontal" | "vertical"; // default: "free"
}
```

**Direction modes:**
- `free`: Detects position based on cursor location (center = inside, edges = before/after)
- `horizontal`: Left/right positioning (before/after based on x-axis)
- `vertical`: Top/bottom positioning (before/after based on y-axis)

### useDraggable

Hook to make elements draggable.

```tsx
interface UseDraggableOptions<T> {
  type: string;           // Unique identifier for drag type
  item: T;                // Data to transfer on drop
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

// Returns
interface UseDraggableReturn {
  draggableProps: {
    draggable: true;
    onDragStart: (e: DragEvent) => void;
    onDragEnd: () => void;
  };
}
```

### useDroppable

Hook to create drop zones.

```tsx
interface UseDroppableOptions<T> {
  id: string;                    // Unique zone identifier
  accept: string | string[];     // Accepted drag types
  onDrop: (item: T, position: DropPosition, e: DragEvent) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

// Returns
interface UseDroppableReturn {
  isOver: boolean;               // Is something hovering?
  canDrop: boolean;              // Can the dragged item drop here?
  dropPosition: DropPosition | null; // "before" | "after" | "inside"
  direction: DragDirection;      // Current direction mode
  droppableProps: {
    onDragOver: (e: DragEvent) => void;
    onDragEnter: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
}
```

### DropIndicator

Visual indicator component showing where items will be dropped.

```tsx
import { DropIndicator, DropOverlay } from "@/components/ui/drop-indicator";

interface DropIndicatorProps {
  isOver: boolean;
  position: DropPosition | null;
  direction: DragDirection;
  color?: DropIndicatorColor;  // default: "blue"
  className?: string;
}

// Full overlay variant
interface DropOverlayProps {
  isOver: boolean;
  color?: DropIndicatorColor;  // default: "blue"
  className?: string;
}
```

**Available colors:**
- `blue` (default)
- `green`
- `red`
- `yellow`
- `purple`
- `pink`
- `orange`
- `cyan`

## Position Detection

### Free Direction
- Center area (25%-75% on both axes) = `inside`
- Edges = `before` or `after` based on dominant axis

### Horizontal Direction
- Left half = `before`
- Right half = `after`

### Vertical Direction
- Top half = `before`
- Bottom half = `after`

## Examples

### Kanban Board (Column Drop)

```tsx
function Column({ state, tickets, onTicketDrop }) {
  const { isOver, droppableProps } = useDroppable({
    id: state.id,
    accept: "ticket",
    onDrop: (ticket) => {
      if (ticket.state_id !== state.id) {
        onTicketDrop(ticket.id, state.id);
      }
    },
  });

  return (
    <div
      {...droppableProps}
      className={isOver ? "ring-2 ring-primary" : ""}
    >
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
```

### Sortable List (with position indicators)

```tsx
function SortableList({ items, onReorder }) {
  return (
    <DragDropProvider direction="vertical">
      {items.map((item, index) => (
        <SortableItem
          key={item.id}
          item={item}
          onDrop={(droppedItem, position) => {
            const newIndex = position === "before" ? index : index + 1;
            onReorder(droppedItem.id, newIndex);
          }}
        />
      ))}
    </DragDropProvider>
  );
}

function SortableItem({ item, onDrop }) {
  const { draggableProps } = useDraggable({
    type: "list-item",
    item: item,
  });

  const { isOver, dropPosition, direction, droppableProps } = useDroppable({
    id: item.id,
    accept: "list-item",
    onDrop: onDrop,
  });

  return (
    <div {...draggableProps} {...droppableProps} className="relative">
      <DropIndicator
        isOver={isOver}
        position={dropPosition}
        direction={direction}
        color="green"
      />
      {item.name}
    </div>
  );
}
```

### Horizontal Tabs (reorderable)

```tsx
function ReorderableTabs({ tabs, onReorder }) {
  return (
    <DragDropProvider direction="horizontal">
      <div className="flex">
        {tabs.map((tab) => (
          <DraggableTab key={tab.id} tab={tab} onReorder={onReorder} />
        ))}
      </div>
    </DragDropProvider>
  );
}
```

## File Structure

```
contexts/
└── drag-drop-context.tsx    # Provider, hooks, types

components/ui/
└── drop-indicator.tsx       # Visual indicator components
```

## TypeScript Types

```tsx
// Direction modes
type DragDirection = "free" | "horizontal" | "vertical";

// Drop positions
type DropPosition = "before" | "after" | "inside";

// Drag data structure
interface DragData<T = unknown> {
  type: string;
  item: T;
}

// Available indicator colors
type DropIndicatorColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "pink"
  | "orange"
  | "cyan";
```
