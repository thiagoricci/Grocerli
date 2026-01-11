# Unit Selection Feature Implementation Plan

## Overview

Add a unit selector dropdown to the quantity input fields, allowing users to specify measurement units (pound, ounce, package, piece) when adding or editing shopping list items.

## Current State

- Items have `quantity` (number) and `unit` (string) fields in `ShoppingItem` type
- Separate quantity input fields exist in both editing and shopping modes
- Recipe ingredients already provide quantity/unit separately
- Unit field is stored but not exposed in the UI for manual entry

## Problem

- Users can enter a numeric quantity but cannot select a unit
- Units are only available through recipe ingredients or voice parsing
- No way to specify "2 lbs chicken", "16 oz milk", "1 package chips", "3 pieces bread"

## Solution

Add a unit selector dropdown alongside the quantity input field in three locations:

1. Item creation section (editing mode)
2. Item creation section (shopping mode)
3. Item editing mode (inline edit)

## Unit Options

```typescript
const UNIT_OPTIONS = [
  { value: "", label: "None" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "oz", label: "Ounces (oz)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "pkg", label: "Package (pkg)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "cups", label: "Cups" },
  { value: "tbsp", label: "Tablespoons" },
  { value: "tsp", label: "Teaspoons" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "l", label: "Liters (l)" },
  { value: "dozen", label: "Dozen" },
];
```

## Implementation Steps

### 1. Add Unit State to GroceryApp

**Location:** `src/components/GroceryApp.tsx`

Add new state variables for unit selection:

```typescript
// Unit selection state for item creation
const [itemUnit, setItemUnit] = useState<string>("");

// Unit selection state for editing
const [editUnit, setEditUnit] = useState<string>("");
```

### 2. Update handleTextInputSubmit to Include Unit

**Location:** `src/components/GroceryApp.tsx`

Modify the text input submit handler to save the selected unit:

```typescript
const handleTextInputSubmit = useCallback(() => {
  const itemName = textInput.trim();
  const qtyValue = itemQuantity.trim();
  const unitValue = itemUnit.trim();

  if (!itemName) return;

  // Find best match in database
  const bestMatch = findBestMatch(itemName);
  const displayName = bestMatch || itemName;

  // Check for duplicate (case-insensitive)
  const isDuplicate = items.some(
    (item) => item.name.toLowerCase() === displayName.toLowerCase()
  );

  if (isDuplicate) {
    toast({
      title: "Item Already Exists",
      description: `"${displayName}" is already in your list.`,
      variant: "destructive",
    });
    return;
  }

  // Convert quantity to number if provided
  let numericQuantity: number | undefined = undefined;
  if (qtyValue) {
    const parsed = parseFloat(qtyValue);
    if (!isNaN(parsed)) {
      numericQuantity = parsed;
    }
  }

  // Handle unit (empty string means undefined)
  const finalUnit = unitValue || undefined;

  // Create new item
  const newItem: ShoppingItem = {
    id: Math.random().toString(36).substr(2, 9),
    name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    completed: false,
    quantity: numericQuantity || undefined,
    unit: finalUnit,
  };

  // Add to list
  setItems((prev) => [...prev, newItem]);

  // Show success toast
  toast({
    title: "Item Added",
    description: numericQuantity
      ? `${numericQuantity}${finalUnit ? ` ${finalUnit} ` : " "}${displayName}`
      : displayName,
  });

  // Clear inputs
  setTextInput("");
  setItemQuantity("");
  setItemUnit("");
}, [textInput, itemQuantity, itemUnit, items, toast]);
```

### 3. Update handleEditItem to Include Unit

**Location:** `src/components/GroceryApp.tsx`

Modify the edit handler to accept and save unit:

```typescript
const handleEditItem = useCallback(
  (id: string, newName: string, newQuantity?: string, newUnit?: string) => {
    // If this is the first click on an item, enter edit mode
    if (editingItemId === null || editingItemId !== id) {
      setEditingItemId(id);
      setEditValue(newName);
      setEditQuantity(newQuantity || "");
      setEditUnit(newUnit || "");
      return;
    }

    // If already editing, save the changes
    const trimmed = newName.trim();
    if (!trimmed) {
      toast({
        title: "Cannot Save",
        description: "Item name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

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

    // Parse quantity
    let numericQuantity: number | undefined = undefined;
    if (newQuantity && newQuantity.trim()) {
      const parsed = parseFloat(newQuantity.trim());
      if (!isNaN(parsed)) {
        numericQuantity = parsed;
      }
    }

    // Handle unit (empty string means undefined)
    const finalUnit = newUnit && newUnit.trim() ? newUnit.trim() : undefined;

    // Update item
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              name: displayName,
              quantity: numericQuantity,
              unit: finalUnit,
            }
          : item
      )
    );

    // Exit edit mode
    setEditingItemId(null);
    setEditValue("");
    setEditQuantity("");
    setEditUnit("");

    toast({
      title: "Item Updated",
      description: `Changed to "${displayName}".`,
    });
  },
  [editingItemId, items, toast]
);
```

### 4. Add Unit Selector to ShoppingList Props

**Location:** `src/components/ShoppingList.tsx`

Update the props interface to include unit editing:

```typescript
interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onEditItem?: (
    id: string,
    newName: string,
    newQuantity?: string,
    newUnit?: string
  ) => void;
  onCancelEdit?: () => void;
  editingItemId?: string | null;
  editValue?: string;
  editQuantity?: string;
  editUnit?: string;
  onEditValueChange?: (value: string) => void;
  onEditQuantityChange?: (value: string) => void;
  onEditUnitChange?: (value: string) => void;
  viewMode?: "editing" | "shopping";
  className?: string;
}
```

### 5. Update ShoppingList Component to Include Unit Selector

**Location:** `src/components/ShoppingList.tsx`

Add unit selector to the edit mode UI:

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add unit options constant at top of file
const UNIT_OPTIONS = [
  { value: "", label: "None" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "oz", label: "Ounces (oz)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "pkg", label: "Package (pkg)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "cups", label: "Cups" },
  { value: "tbsp", label: "Tablespoons" },
  { value: "tsp", label: "Teaspoons" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "l", label: "Liters (l)" },
  { value: "dozen", label: "Dozen" },
];

// In the component, update the edit mode section:
{
  viewMode === "editing" && editingItemId === item.id ? (
    // Edit mode - show input fields with save/cancel buttons
    <div className="flex-1 flex gap-2 flex-wrap">
      <Input
        type="number"
        value={editQuantity || ""}
        onChange={(e) =>
          onEditQuantityChange && onEditQuantityChange(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEditItem &&
              onEditItem(
                item.id,
                editValue || "",
                editQuantity || "",
                editUnit || ""
              );
          } else if (e.key === "Escape") {
            onCancelEdit && onCancelEdit();
          }
        }}
        placeholder="Qty"
        min="0"
        step="0.5"
        className="w-20 h-10"
      />
      <Select
        value={editUnit || ""}
        onValueChange={(value) => onEditUnitChange && onEditUnitChange(value)}
      >
        <SelectTrigger className="w-32 h-10">
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          {UNIT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="text"
        value={editValue || ""}
        onChange={(e) => onEditValueChange && onEditValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEditItem &&
              onEditItem(
                item.id,
                editValue || "",
                editQuantity || "",
                editUnit || ""
              );
          } else if (e.key === "Escape") {
            onCancelEdit && onCancelEdit();
          }
        }}
        autoFocus
        className="h-10 text-base flex-1 min-w-[150px]"
      />
      <Button
        size="sm"
        onClick={() =>
          onEditItem &&
          onEditItem(
            item.id,
            editValue || "",
            editQuantity || "",
            editUnit || ""
          )
        }
        className="bg-green-500 hover:bg-green-600 h-10 px-3"
      >
        <Check className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onCancelEdit && onCancelEdit()}
        className="h-10 px-3"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    // Normal display mode - update to show unit
    <div className="flex items-center gap-2 flex-1">
      <span
        onClick={
          viewMode === "editing"
            ? () => {
                onEditValueChange && onEditValueChange(item.name);
                onEditQuantityChange &&
                  onEditQuantityChange(item.quantity?.toString() || "");
                onEditUnitChange && onEditUnitChange(item.unit || "");
                onEditItem &&
                  onEditItem(
                    item.id,
                    item.name,
                    item.quantity?.toString() || "",
                    item.unit || ""
                  );
              }
            : undefined
        }
        className={cn(
          "text-lg font-medium transition-all duration-300 py-2 cursor-pointer hover:bg-muted/50 rounded px-2",
          viewMode === "editing" && "",
          item.completed
            ? "text-muted-foreground line-through opacity-70"
            : "text-foreground"
        )}
      >
        {item.name}
      </span>
      {(item.quantity || item.unit) && (
        <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded min-w-[32px] text-center">
          {item.quantity}
          {item.unit ? ` ${item.unit}` : ""}
        </span>
      )}
      {viewMode === "editing" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onEditValueChange && onEditValueChange(item.name);
            onEditQuantityChange &&
              onEditQuantityChange(item.quantity?.toString() || "");
            onEditUnitChange && onEditUnitChange(item.unit || "");
            onEditItem &&
              onEditItem(
                item.id,
                item.name,
                item.quantity?.toString() || "",
                item.unit || ""
              );
          }}
          className="flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-destructive/10 p-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
          aria-label="Edit item"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
```

### 6. Add Unit Selector to Item Creation (Editing Mode)

**Location:** `src/components/GroceryApp.tsx`

Update the input section in editing mode to include unit selector:

```typescript
// Add import for Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Add UNIT_OPTIONS constant near top of component
const UNIT_OPTIONS = [
  { value: "", label: "None" },
  { value: "lbs", label: "Pounds (lbs)" },
  { value: "oz", label: "Ounces (oz)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "pkg", label: "Package (pkg)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "cups", label: "Cups" },
  { value: "tbsp", label: "Tablespoons" },
  { value: "tsp", label: "Teaspoons" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "l", label: "Liters (l)" },
  { value: "dozen", label: "Dozen" },
];

// Update the input section (around line 688-702):
{
  /* Input Fields */
}
<div className="flex flex-col sm:flex-row gap-2">
  <Input
    type="text"
    placeholder="Item name..."
    value={textInput}
    onChange={(e) => setTextInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleTextInputSubmit();
      }
    }}
    className="h-12 md:h-14 text-base bg-gray-100 border-2 border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 flex-1"
  />
  <div className="flex gap-2">
    <Input
      type="number"
      placeholder="Qty"
      value={itemQuantity}
      onChange={(e) => setItemQuantity(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleTextInputSubmit();
        }
      }}
      min="0"
      step="0.5"
      className="h-12 md:h-14 w-24 text-base bg-gray-100 border-2 border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
    />
    <Select value={itemUnit} onValueChange={setItemUnit}>
      <SelectTrigger className="h-12 md:h-14 w-36 bg-gray-100 border-2 border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400">
        <SelectValue placeholder="Unit" />
      </SelectTrigger>
      <SelectContent>
        {UNIT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Button
      onClick={handleTextInputSubmit}
      disabled={!textInput.trim()}
      className="h-12 md:h-14 px-6"
    >
      Add
    </Button>
  </div>
</div>;
```

### 7. Add Unit Selector to Item Creation (Shopping Mode)

**Location:** `src/components/GroceryApp.tsx`

Update the input section in shopping mode (around line 744-782):

```typescript
{
  /* Input Fields - Allow adding items while shopping */
}
<div className="flex flex-col sm:flex-row gap-2">
  <div className="flex-1 relative">
    <Input
      type="text"
      placeholder="Item name..."
      value={textInput}
      onChange={(e) => setTextInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleTextInputSubmit();
        }
      }}
      className="h-12 md:h-14 text-base bg-gray-100 border-2 border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
    />
  </div>
  <div className="flex gap-2">
    <Input
      type="number"
      placeholder="Qty"
      value={itemQuantity}
      onChange={(e) => setItemQuantity(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleTextInputSubmit();
        }
      }}
      min="0"
      step="0.5"
      className="h-12 md:h-14 w-24 text-base bg-gray-100 border-2 border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
    />
    <Select value={itemUnit} onValueChange={setItemUnit}>
      <SelectTrigger className="h-12 md:h-14 w-36 bg-gray-100 border-2 border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400">
        <SelectValue placeholder="Unit" />
      </SelectTrigger>
      <SelectContent>
        {UNIT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Button
      onClick={handleTextInputSubmit}
      disabled={!textInput.trim()}
      className="h-12 md:h-14 px-6"
    >
      Add
    </Button>
  </div>
</div>;
```

### 8. Update ShoppingList Props Pass-Through

**Location:** `src/components/GroceryApp.tsx`

Update all ShoppingList component calls to pass the new unit-related props:

```typescript
// In editing mode (around line 718-731):
<ShoppingList
  items={items}
  onToggleItem={handleToggleItem}
  onRemoveItem={handleRemoveItem}
  onEditItem={handleEditItem}
  onCancelEdit={handleCancelEdit}
  editingItemId={editingItemId}
  editValue={editValue}
  editQuantity={editQuantity}
  editUnit={editUnit}
  onEditValueChange={setEditValue}
  onEditQuantityChange={setEditQuantity}
  onEditUnitChange={setEditUnit}
  viewMode="editing"
  className="animate-slide-up"
/>

// In shopping mode (around line 805-818):
<ShoppingList
  items={items}
  onToggleItem={handleToggleItem}
  onRemoveItem={handleRemoveItem}
  onEditItem={handleEditItem}
  onCancelEdit={handleCancelEdit}
  editingItemId={editingItemId}
  editValue={editValue}
  editQuantity={editQuantity}
  editUnit={editUnit}
  onEditValueChange={setEditValue}
  onEditQuantityChange={setEditQuantity}
  onEditUnitChange={setEditUnit}
  viewMode="shopping"
  className="animate-slide-up"
/>
```

### 9. Update handleCancelEdit to Clear Unit

**Location:** `src/components/GroceryApp.tsx`

```typescript
const handleCancelEdit = useCallback(() => {
  setEditingItemId(null);
  setEditValue("");
  setEditQuantity("");
  setEditUnit("");
}, []);
```

### 10. Update Item Display to Show Unit

**Location:** `src/components/ShoppingList.tsx`

Update the item display to show both quantity and unit together:

```typescript
// In the normal display mode (around line 363-367):
{
  (item.quantity || item.unit) && (
    <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded min-w-[32px] text-center">
      {item.quantity}
      {item.unit ? ` ${item.unit}` : ""}
    </span>
  );
}
```

## UI Design

### Item Creation Section (Editing Mode)

```
┌─────────────────────────────────────────────────────────────┐
│  [ Item Name Input           ]  [ Qty ]  [ Unit ▼ ] [Add] │
└─────────────────────────────────────────────────────────────┘
```

### Item Creation Section (Shopping Mode)

```
┌─────────────────────────────────────────────────────────────┐
│  [ Item Name Input           ]  [ Qty ]  [ Unit ▼ ] [Add] │
└─────────────────────────────────────────────────────────────┘
```

### Item Display (Editing Mode - Normal)

```
┌─────────────────────────────────────────────────────────────┐
│  Item Name          [ 2 lbs ]  [✏️]  [🗑️]                │
└─────────────────────────────────────────────────────────────┘
```

### Item Display (Editing Mode - Edit)

```
┌─────────────────────────────────────────────────────────────┐
│  [ Qty ]  [ Unit ▼ ]  [ Item Name ]  [✓]  [✕]         │
└─────────────────────────────────────────────────────────────┘
```

## Key Considerations

- **Unit Storage:** Store as string in `unit` field (empty string = undefined)
- **Empty Unit:** Allow empty/undefined units (e.g., "2 eggs" without unit)
- **Unit Display:** Show quantity and unit together as "2 lbs" or "16 oz"
- **Mobile Responsiveness:** Use flex-wrap to handle smaller screens
- **Keyboard Navigation:** Support Enter to submit, Escape to cancel edit
- **Unit Consistency:** Use standard abbreviations (lbs, oz, kg, g, etc.)
- **Recipe Integration:** Recipe units should continue to work as-is

## Testing Checklist

- [ ] Add item with name only
- [ ] Add item with name + quantity
- [ ] Add item with name + quantity + unit
- [ ] Add item with name + unit (no quantity)
- [ ] Edit item name without changing quantity/unit
- [ ] Edit quantity without changing name/unit
- [ ] Edit unit without changing name/quantity
- [ ] Edit all three (name, quantity, unit)
- [ ] Remove unit (set to "None")
- [ ] Remove quantity (set to empty)
- [ ] Recipe ingredients preserve units
- [ ] Toast notifications show quantity + unit
- [ ] Duplicate detection works with units
- [ ] Mobile responsive layout works correctly
- [ ] Keyboard shortcuts work (Enter, Escape)

## Files to Modify

1. `src/components/GroceryApp.tsx` - Add unit state, update handlers, add unit selectors
2. `src/components/ShoppingList.tsx` - Add unit selector to edit mode, update display

## Files to Reference

- `src/components/ui/select.tsx` - Select component implementation
- `src/types/shopping.ts` - ShoppingItem type definition (already has unit field)
- `src/components/GroceryApp.tsx` - Main app component with state management
- `src/components/ShoppingList.tsx` - Shopping list display component
