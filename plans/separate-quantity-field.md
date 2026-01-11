# Separate Quantity Field Implementation Plan

## Overview

Add a separate quantity input field for shopping list items, allowing users to add and edit quantities independently from item names.

## Current State

- Items have `quantity` and `unit` fields in `ShoppingItem` type
- `extractQuantity()` parses quantities from text input
- Recipe ingredients provide quantity/unit separately
- Manual text input parses quantities from the input string

## Problem

- Quantity is embedded in text input (e.g., "2 lbs chicken")
- No separate quantity field for manual entry
- Can't easily edit quantity without editing the whole item

## Solution

### 1. Add Separate Quantity Input to Item Creation

**Location:** `src/components/GroceryApp.tsx`

Add a separate quantity input field alongside the name input:

```typescript
// New state for quantity input
const [itemQuantity, setItemQuantity] = useState<string>('');

// Updated handleTextInputSubmit
const handleTextInputSubmit = useCallback(() => {
  const itemName = textInput.trim();
  const qtyValue = itemQuantity.trim();

  if (!itemName) return;

  // Find best match
  const bestMatch = findBestMatch(itemName);
  const displayName = bestMatch || itemName;

  // Convert quantity to number
  let numericQuantity: number | undefined = undefined;
  if (qtyValue) {
    const parsed = parseFloat(qtyValue);
    if (!isNaN(parsed)) {
      numericQuantity = parsed;
    }
  }

  // Check for duplicate
  const isDuplicate = items.some(item =>
    item.name.toLowerCase() === displayName.toLowerCase()
  );

  if (isDuplicate) {
    toast({ title: "Item Already Exists", ... });
    return;
  }

  // Create new item
  const newItem: ShoppingItem = {
    id: Math.random().toString(36).substr(2, 9),
    name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    completed: false,
    quantity: numericQuantity || undefined,
    unit: undefined, // Could add unit field later
  };

  setItems(prev => [...prev, newItem]);
  setTextInput('');
  setItemQuantity('');

  toast({ title: "Item Added", ... });
}, [textInput, itemQuantity, items, toast]);
```

### 2. Update ShoppingList Component for Quantity Editing

**Location:** `src/components/ShoppingList.tsx`

Add quantity edit capability:

```typescript
// Add to props
interface ShoppingListProps {
  // ... existing props
  onUpdateQuantity?: (id: string, quantity: number | undefined) => void;
}

// In component, add quantity edit UI
{
  viewMode === "editing" && editingItemId === item.id && (
    <div className="flex gap-2">
      <Input
        type="number"
        value={editQuantity || ""}
        onChange={(e) => setEditQuantity(e.target.value)}
        className="w-20 h-10"
        placeholder="Qty"
        min="0"
        step="0.5"
      />
      <Input
        type="text"
        value={editValue || ""}
        onChange={(e) => onEditValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEditItem && onEditItem(item.id, editValue, editQuantity);
          }
        }}
        className="flex-1 h-10"
      />
      <Button
        size="sm"
        onClick={() =>
          onEditItem && onEditItem(item.id, editValue, editQuantity)
        }
      >
        <Check className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Normal display with quantity
{
  viewMode === "editing" && editingItemId !== item.id && (
    <div className="flex items-center gap-3">
      <span
        onClick={() => {
          onEditValueChange(item.name);
          onEditItem &&
            onEditItem(item.id, item.name, item.quantity?.toString());
        }}
        className="flex-1 text-lg font-medium cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
      >
        {item.name}
      </span>
      {item.quantity && (
        <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded">
          {item.quantity}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onEditItem &&
          onEditItem(item.id, item.name, item.quantity?.toString())
        }
      >
        <Edit2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

### 3. Update Edit Handler in GroceryApp

```typescript
const handleEditItem = useCallback((id: string, newName: string, newQuantity?: string) => {
  // If this is the first click, enter edit mode
  if (editingItemId === null || editingItemId !== id) {
    setEditingItemId(id);
    setEditValue(newName);
    setEditQuantity(newQuantity || item.quantity?.toString() || '');
    return;
  }

  // Save the changes
  const trimmedName = newName.trim();
  if (!trimmedName) {
    toast({ title: "Cannot Save", description: "Item name cannot be empty.", variant: "destructive" });
    return;
  }

  // Parse quantity
  let numericQuantity: number | undefined = undefined;
  if (newQuantity && newQuantity.trim()) {
    const parsed = parseFloat(newQuantity.trim());
    if (!isNaN(parsed)) {
      numericQuantity = parsed;
    }
  }

  // Capitalize name
  const displayName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);

  // Check for duplicate
  const isDuplicate = items.some(item =>
    item.id !== id && item.name.toLowerCase() === displayName.toLowerCase()
  );

  if (isDuplicate) {
    toast({ title: "Item Already Exists", ... });
    return;
  }

  // Update item
  setItems(prev => prev.map(item =>
    item.id === id ? { ...item, name: displayName, quantity: numericQuantity } : item
  ));

  // Exit edit mode
  setEditingItemId(null);
  setEditValue('');
  setEditQuantity('');

  toast({ title: "Item Updated", ... });
}, [editingItemId, items, toast]);
```

### 4. Add Edit Icon Import

```typescript
import { Edit2 } from "lucide-react";
```

## UI Design

### Item Creation Section

```
┌─────────────────────────────────────────────────────┐
│  [ Item Name Input ]  [ Qty ]  [ Add ]  │
└─────────────────────────────────────────────────────┘
```

### Item Display (Editing Mode)

```
┌─────────────────────────────────────────────────────┐
│  [ Qty ]  [ Item Name Input ]  [✓]  [✕]  │
└─────────────────────────────────────────────────────┘
```

### Item Display (Normal)

```
┌─────────────────────────────────────────────────────┐
│  Item Name          [ 2 ]  [✏️]  [🗑️]  │
└─────────────────────────────────────────────────────┘
```

## Implementation Steps

1. ✅ Add `itemQuantity` state to GroceryApp
2. ✅ Add quantity input field in item creation section
3. ✅ Update `handleTextInputSubmit` to use separate quantity
4. ✅ Add `editQuantity` state to GroceryApp
5. ✅ Add `Edit2` icon import
6. ✅ Update `handleEditItem` to accept quantity parameter
7. ✅ Update ShoppingList props to include quantity editing
8. ✅ Update ShoppingList component UI for quantity editing
9. ✅ Add unit field support (optional future enhancement)

## Key Considerations

- **Quantity Type:** Store as number for calculations, display as string
- **Empty Quantity:** Allow empty/undefined quantities (e.g., "eggs" without count)
- **Decimal Support:** Allow 0.5, 1.5, etc. for measurements
- **Validation:** Prevent negative quantities, allow zero
- **Units:** Could add unit dropdown later (lbs, cups, kg, etc.)
- **Recipe Integration:** Recipe quantities already work correctly

## Testing Checklist

- [ ] Add item with name only
- [ ] Add item with name + quantity
- [ ] Edit item name without changing quantity
- [ ] Edit quantity without changing name
- [ ] Edit both name and quantity
- [ ] Remove quantity (set to empty)
- [ ] Recipe ingredients preserve quantities
- [ ] Manual input preserves quantities
- [ ] Toast notifications show quantities
- [ ] Duplicate detection works with quantities
