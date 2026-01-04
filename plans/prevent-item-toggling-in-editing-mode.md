# Plan: Prevent Item Toggling in Editing Mode

## Problem Statement

Currently, users can click on shopping list items to toggle their completion status (mark/cross them off) regardless of whether they are in editing mode (list mode) or shopping mode. This is incorrect behavior - items should only be toggleable when in shopping mode.

## Current Behavior

- In [`ShoppingList.tsx`](src/components/ShoppingList.tsx:267), each item has an `onClick` handler that calls `onToggleItem(item.id)`
- This handler is active in both editing and shopping modes
- The cursor pointer style is also applied in both modes

## Expected Behavior

- **Editing Mode (List Mode)**: Items should NOT be clickable/toggleable. Users can only add or remove items.
- **Shopping Mode**: Items SHOULD be clickable/toggleable so users can mark items as complete while shopping.

## Solution

### File to Modify

- [`src/components/ShoppingList.tsx`](src/components/ShoppingList.tsx)

### Changes Required

#### 1. Conditionally Apply onClick Handler (Line 267)

**Current Code:**

```tsx
<div
  key={item.id}
  onClick={() => onToggleItem(item.id)}
  className={cn(
    "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 animate-slide-up hover:shadow-md cursor-pointer",
    ...
  )}
>
```

**New Code:**

```tsx
<div
  key={item.id}
  onClick={viewMode === 'shopping' ? () => onToggleItem(item.id) : undefined}
  className={cn(
    "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 animate-slide-up",
    viewMode === 'shopping' && "hover:shadow-md cursor-pointer",
    ...
  )}
>
```

#### 2. Conditionally Apply Cursor Pointer and Hover Effects

- Remove `cursor-pointer` from the base className
- Only add `cursor-pointer` and `hover:shadow-md` when `viewMode === 'shopping'`

### Implementation Details

1. **onClick Handler**: Use a ternary operator to only assign the click handler when in shopping mode
2. **Cursor Style**: Only apply `cursor-pointer` when in shopping mode
3. **Hover Effect**: Only apply `hover:shadow-md` when in shopping mode

### Benefits

- Prevents accidental item completion in editing mode
- Provides clearer UX distinction between the two modes
- Maintains existing shopping mode functionality
- No breaking changes to the API or component props

### Testing Checklist

- [ ] In editing mode, clicking on items should NOT toggle their completion status
- [ ] In editing mode, items should NOT have a pointer cursor on hover
- [ ] In editing mode, items should NOT show shadow on hover
- [ ] In shopping mode, clicking on items SHOULD toggle their completion status
- [ ] In shopping mode, items SHOULD have a pointer cursor on hover
- [ ] In shopping mode, items SHOULD show shadow on hover
- [ ] Remove button should still work in editing mode (line 300-313)
- [ ] Progress tracking should still work in shopping mode

### Edge Cases Considered

- Empty list state: No changes needed (no items to click)
- Category grouping: No changes needed (applies to all items equally)
- Remove button: Already conditionally rendered only in editing mode (line 300)
- Keyboard accessibility: No keyboard handlers on items, so no impact

## Related Files

- [`src/components/GroceryApp.tsx`](src/components/GroceryApp.tsx) - Parent component that passes viewMode prop
- No changes needed to GroceryApp.tsx

## Migration Notes

This is a non-breaking change. The component interface remains the same:

- Props: `items`, `onToggleItem`, `onRemoveItem`, `viewMode`, `className`
- All existing functionality preserved
- Only behavior change: items no longer clickable in editing mode
