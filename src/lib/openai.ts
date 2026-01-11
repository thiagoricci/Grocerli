import OpenAI from 'openai';
import type { Recipe } from '@/types/recipe';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export interface GenerateRecipeParams {
  dishName?: string;
  ingredients?: string[];
}

export async function generateRecipeByDish(dishName: string): Promise<Recipe> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful cooking assistant. Generate recipes in JSON format.
        
        Always respond with valid JSON in the following format:
        {
          "name": "Recipe Name",
          "description": "Brief description",
          "ingredients": [{"name": "item", "quantity": "amount", "unit": "unit"}],
          "instructions": ["step 1", "step 2"],
          "prepTime": "time",
          "cookTime": "time",
          "servings": number,
          "difficulty": "Easy/Medium/Hard"
        }`
      },
      {
        role: 'user',
        content: `Generate a recipe for: ${dishName}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No recipe generated');
  
  const data = JSON.parse(content);
  return {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
}

export async function recommendRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful cooking assistant. Suggest recipes based on ingredients.
        
        Always respond with valid JSON in the following format:
        {
          "recipes": [
            {
              "name": "Recipe Name",
              "description": "Brief description",
              "ingredients": [{"name": "item", "quantity": "amount", "unit": "unit"}],
              "instructions": ["step 1", "step 2"],
              "prepTime": "time",
              "cookTime": "time",
              "servings": number,
              "difficulty": "Easy/Medium/Hard"
            }
          ]
        }`
      },
      {
        role: 'user',
        content: `Suggest 3 recipes using these ingredients: ${ingredients.join(', ')}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No recipes generated');
  
  const data = JSON.parse(content);
  const recipes = data.recipes || [];
  
  // Add unique IDs to each recipe
  return recipes.map((recipe: Recipe) => ({
    ...recipe,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }));
}
