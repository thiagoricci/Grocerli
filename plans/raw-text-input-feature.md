# Raw Text Input Feature - Implementation Plan

## Overview

Add a simple text input feature that allows users to type items without any parsing or validation. When a user submits text, it should be added to the list exactly as typed (with only first letter capitalization).

## Current Implementation

The existing text input (`handleTextInputSubmit`) uses `parseAndAddItems` which:

- Removes filler words (i need, get me, buy, etc.)
- Splits input by separators (and, also, plus, commas, etc.)
- Extracts quantities and units from the text
- Validates items against a 200+ item grocery database
- Uses fuzzy matching to find best matches
- Creates multiple items from a single input

## Required Changes

### 1. Create New Function: `addRawItem`

**Location:** `src/components/GroceryApp.tsx`

**Purpose:** Add items to the list without any parsing or validation

**Implementation:**

```typescript
const addRawItem = useCallback(
  (rawText: string) => {
    // Trim whitespace
    const trimmed = rawText.trim();

    // Skip empty input
    if (!trimmed) return;

    // Capitalize first letter only
    const displayName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

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

    // Create new item with exact text
    const newItem: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: displayName,
      completed: false,
      quantity: undefined,
      unit: undefined,
    };

    // Add to list
    setItems((prev) => [...prev, newItem]);

    // Show success toast
    toast({
      title: "Item Added",
      description: `Added "${displayName}" to your list.`,
    });
  },
  [items, toast]
);
```

### 2. Modify `handleTextInputSubmit`

**Location:** `src/components/GroceryApp.tsx` (line 261)

**Current Implementation:**

```typescript
const handleTextInputSubmit = useCallback(() => {
  if (textInput.trim()) {
    parseAndAddItems(textInput.trim());
    setTextInput("");
  }
}, [textInput, parseAndAddItems]);
```

**New Implementation:**

```typescript
const handleTextInputSubmit = useCallback(() => {
  if (textInput.trim()) {
    addRawItem(textInput.trim());
    setTextInput("");
  }
}, [textInput, addRawItem]);
```

### 3. Update Dependencies

- The `addRawItem` function depends on `items` and `toast`
- Update the dependency array for `addRawItem` to include these

## Behavior Changes

### Before

- Input: "2lbs of beef"
- Result: Parsed, validated, potentially split into multiple items
- Example: Could become "Beef" with quantity 2 and unit "lbs"

### After

- Input: "2lbs of beef"
- Result: Single item with exact text "2lbs of Beef"
- No parsing, no validation, no splitting

## Edge Cases to Handle

1. **Empty Input:** Skip if only whitespace
2. **Duplicate Items:** Show warning toast if item already exists (case-insensitive)
3. **Capitalization:** Only capitalize first letter, preserve rest of text exactly
4. **Whitespace:** Trim leading/trailing whitespace
5. **Special Characters:** Preserve all special characters exactly as typed

## Testing Checklist

- [ ] Test with simple text: "apples" → "Apples"
- [ ] Test with quantity: "2lbs of beef" → "2lbs of Beef"
- [ ] Test with special characters: "organic! eggs?" → "Organic! eggs?"
- [ ] Test duplicate detection: Add "milk" twice, second time shows warning
- [ ] Test in editing mode
- [ ] Test in shopping mode (adding more items while shopping)
- [ ] Test empty input (should not add anything)
- [ ] Test whitespace-only input (should not add anything)

## Files to Modify

1. **src/components/GroceryApp.tsx**
   - Add new `addRawItem` function
   - Modify `handleTextInputSubmit` function

## Notes

- The `parseAndAddItems` function will remain unchanged for voice input
- Voice input will continue to use natural language parsing
- Only text input will use the new raw item addition
- This maintains backward compatibility with existing voice features
- The `extractQuantity` function is no longer used by text input (but remains for voice)

## Future Enhancements (Optional)

- Add a toggle switch to choose between "parsed" and "raw" mode for text input
- Allow users to edit items after adding them
- Add bulk import from text file or clipboard
