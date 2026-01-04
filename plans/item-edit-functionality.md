# Item Edit Functionality - Implementation Plan

## Overview

Add the ability for users to edit item names in editing mode. When a user clicks on an item name in editing mode, they can retype it to correct mistakes (e.g., changing "2lbs of beef" to "2lbs of chicken").

## Current Behavior

- In editing mode: Items show a remove button (Trash2)
- In shopping mode: Clicking on an item toggles its completed state
- Item names are static text that cannot be edited

## Required Changes

### 1. Update ShoppingList Component

**File:** `src/components/ShoppingList.tsx`

**Add new prop:**

```typescript
interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onEditItem?: (id: string, newName: string) => void; // NEW
  editingItemId?: string | null; // NEW - which item is currently being edited
  viewMode?: "editing" | "shopping";
  className?: string;
}
```

**Modify item rendering:**

- In editing mode, make the item name clickable
- When `editingItemId` matches the item, show an input field instead of text
- When editing, show save/cancel buttons instead of remove button

### 2. Update GroceryApp Component

**File:** `src/components/GroceryApp.tsx`

**Add state for editing:**

```typescript
const [editingItemId, setEditingItemId] = useState<string | null>(null);
const [editValue, setEditValue] = useState("");
```

**Add edit handler:**

```typescript
const handleEditItem = useCallback(
  (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    // Capitalize first letter only
    const displayName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    // Check for duplicate (excluding current item)
    const isDuplicate = items.some(
      (item) =>
        item.id !== id && item.name.toLowerCase() === displayName.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Item Already Exists",
        description: `"${displayName}" is already in your list.`,
        variant: "destructive",
      });
      return;
    }

    // Update item name
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: displayName } : item
      )
    );

    // Exit edit mode
    setEditingItemId(null);
    setEditValue("");

    toast({
      title: "Item Updated",
      description: `Changed to "${displayName}".`,
    });
  },
  [items, toast]
);
```

**Add cancel edit handler:**

```typescript
const handleCancelEdit = useCallback(() => {
  setEditingItemId(null);
  setEditValue("");
}, []);
```

**Update ShoppingList props:**

```typescript
<ShoppingList
  items={items}
  onToggleItem={handleToggleItem}
  onRemoveItem={handleRemoveItem}
  onEditItem={handleEditItem}
  editingItemId={editingItemId}
  viewMode={viewMode}
  className="animate-slide-up"
/>
```

### 3. UI Changes in ShoppingList

**Item rendering logic:**

```typescript
{
  viewMode === "editing" && editingItemId === item.id ? (
    // Edit mode - show input field
    <div className="flex-1 flex gap-2">
      <Input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEditItem && onEditItem(item.id, editValue);
          } else if (e.key === "Escape") {
            onCancelEdit && onCancelEdit();
          }
        }}
        autoFocus
        className="h-10 text-base"
      />
      <Button
        size="sm"
        onClick={() => onEditItem && onEditItem(item.id, editValue)}
        className="bg-green-500 hover:bg-green-600"
      >
        Save
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onCancelEdit && onCancelEdit()}
      >
        Cancel
      </Button>
    </div>
  ) : (
    // Normal display mode
    <span
      onClick={
        viewMode === "editing"
          ? () => {
              setEditingItemId(item.id);
              setEditValue(item.name);
            }
          : undefined
      }
      className={cn(
        "flex-1 text-lg font-medium transition-all duration-300 py-2",
        viewMode === "editing" &&
          "cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2",
        item.completed
          ? "text-muted-foreground line-through opacity-70"
          : "text-foreground"
      )}
    >
      {/* Quantity and unit display */}
      {((item.quantity !== undefined && item.quantity !== null) ||
        item.unit) && (
        <span className="font-bold text-primary mr-2">
          {item.quantity !== undefined && item.quantity !== null
            ? item.quantity
            : ""}
          {item.unit && <span className="lowercase">{item.unit}</span>}
        </span>
      )}
      {item.name}
    </span>
  );
}
```

**Remove button handling:**

- Only show remove button when NOT in edit mode
- Hide remove button when editing an item

## User Flow

1. User is in editing mode
2. User sees item "2lbs of beef" in the list
3. User clicks on the item name (it's clickable with hover effect)
4. The item name is replaced with an input field containing "2lbs of beef"
5. User types to change it to "2lbs of chicken"
6. User presses Enter or clicks "Save" button
7. Item is updated to "2lbs of Chicken"
8. Toast notification confirms the change
9. User can also press Escape or click "Cancel" to discard changes

## Edge Cases to Handle

1. **Empty Input:** Don't allow saving empty item names
2. **Duplicate Items:** Show warning if new name matches another item (case-insensitive)
3. **Keyboard Shortcuts:** Enter to save, Escape to cancel
4. **Auto-focus:** Input field should be auto-focused when entering edit mode
5. **Capitalization:** Only capitalize first letter, preserve rest exactly as typed

## Testing Checklist

- [ ] Click on item name in editing mode → enters edit mode
- [ ] Type new name and press Enter → item updated
- [ ] Type new name and click Save → item updated
- [ ] Press Escape → edit mode cancelled, original name preserved
- [ ] Click Cancel → edit mode cancelled, original name preserved
- [ ] Try to save empty name → no change, stays in edit mode
- [ ] Try to save duplicate name → warning toast shown
- [ ] Edit mode only works in editing mode (not shopping mode)
- [ ] Only one item can be edited at a time
- [ ] Remove button hidden when editing an item
- [ ] Input field auto-focused when entering edit mode

## Files to Modify

1. **src/components/ShoppingList.tsx**

   - Add `onEditItem` and `editingItemId` props
   - Add `onCancelEdit` prop
   - Modify item rendering to show input field when editing
   - Add save/cancel buttons in edit mode
   - Make item name clickable in editing mode

2. **src/components/GroceryApp.tsx**
   - Add `editingItemId` state
   - Add `editValue` state
   - Add `handleEditItem` function
   - Add `handleCancelEdit` function
   - Pass new props to ShoppingList component

## Notes

- Edit functionality is only available in editing mode
- Shopping mode continues to toggle items on click
- Voice input remains unchanged
- Raw text input remains unchanged
- This feature complements the raw text input feature by allowing corrections
