import { type ShoppingItem } from '@/components/ShoppingList';
import { type SavedList } from '@/types/shopping';
import { type SavedRecipe } from '@/types/recipe';

const STORAGE_KEYS = {
  CURRENT_LIST: 'voice-shopper-current-list',
  HISTORY: 'voice-shopper-history',
  SAVED_RECIPES: 'voice-shopper-saved-recipes',
} as const;

/**
 * Save the current active list to localStorage
 */
export const saveCurrentList = (items: ShoppingItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LIST, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save current list to localStorage:', error);
  }
};

/**
 * Load the current active list from localStorage
 */
export const loadCurrentList = (): ShoppingItem[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_LIST);
    if (stored) {
      return JSON.parse(stored) as ShoppingItem[];
    }
  } catch (error) {
    console.error('Failed to load current list from localStorage:', error);
  }
  return null;
};

/**
 * Save history to localStorage
 */
export const saveHistory = (history: SavedList[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
  }
};

/**
 * Load history from localStorage
 * Handles migration from old format (ShoppingItem[][]) to new format (SavedList[])
 */
export const loadHistory = (): SavedList[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Migration: Handle old format (ShoppingItem[][]) and convert to SavedList[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Check if first element is a SavedList (has id property)
        if ('id' in parsed[0]) {
          return parsed as SavedList[];
        } else {
          // Migrate old format to new format
          const migrated: SavedList[] = parsed.map((items: ShoppingItem[], index: number) => ({
            id: `migrated-${Date.now()}-${index}`,
            items: items,
            createdAt: Date.now() - (index * 1000), // Stagger timestamps
            updatedAt: Date.now(),
          }));
          // Save migrated data
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(migrated));
          return migrated;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
  }
  return null;
};

/**
 * Save a recipe to localStorage
 */
export const saveRecipe = (recipe: SavedRecipe): void => {
  try {
    const existing = loadRecipes();
    const updated = [recipe, ...existing].slice(0, 10); // Keep max 10 recipes
    localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recipe to localStorage:', error);
  }
};

/**
 * Load all saved recipes from localStorage
 */
export const loadRecipes = (): SavedRecipe[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVED_RECIPES);
    if (stored) {
      return JSON.parse(stored) as SavedRecipe[];
    }
  } catch (error) {
    console.error('Failed to load recipes from localStorage:', error);
  }
  return [];
};

/**
 * Delete a specific recipe from localStorage
 */
export const deleteRecipe = (recipeId: string): void => {
  try {
    const existing = loadRecipes();
    const updated = existing.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete recipe from localStorage:', error);
  }
};

/**
 * Clear all stored data from localStorage
 */
export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LIST);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SAVED_RECIPES);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};
