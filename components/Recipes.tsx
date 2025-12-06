'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface FoodItem {
  id: string
  name: string
  protein: number
  fat: number
  carbs: number
}

interface RecipeIngredient {
  id: string
  grams: number
  foodItem: FoodItem
}

interface Recipe {
  id: string
  name: string
  instructions: string
  servings: number
  ingredients: RecipeIngredient[]
}

interface MacroCalculations {
  totalProtein: number
  totalFat: number
  totalCarbs: number
  totalCalories: number
  caloriesPerServing: number
  ketoRatio: number
}

const CALORIES_PER_GRAM_PROTEIN = 4
const CALORIES_PER_GRAM_FAT = 9
const CALORIES_PER_GRAM_CARBS = 4

export default function Recipes() {
  const { data: session } = useSession()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [targetRatio, setTargetRatio] = useState<number>(3.0)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    servings: '1',
    ingredients: [] as Array<{ foodItemId: string; grams: string }>,
  })
  const [isEditingQuantities, setIsEditingQuantities] = useState(false)
  const [isSavingQuantities, setIsSavingQuantities] = useState(false)

  useEffect(() => {
    fetchRecipes()
    fetchFoodItems()
    fetchPreferences()
  }, [])

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes')
      const data = await res.json()
      setRecipes(data)
    } catch (error) {
      console.error('Failed to fetch recipes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFoodItems = async () => {
    try {
      const res = await fetch('/api/food-items')
      const data = await res.json()
      setFoodItems(data)
    } catch (error) {
      console.error('Failed to fetch food items:', error)
    }
  }

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/preferences')
      const data = await res.json()
      setTargetRatio(data.targetRatio)
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const calculateMacros = (recipe: Recipe): MacroCalculations => {
    let totalProtein = 0
    let totalFat = 0
    let totalCarbs = 0

    recipe.ingredients.forEach((ing) => {
      const multiplier = ing.grams / 100
      totalProtein += ing.foodItem.protein * multiplier
      totalFat += ing.foodItem.fat * multiplier
      totalCarbs += ing.foodItem.carbs * multiplier
    })

    const totalCalories =
      totalProtein * CALORIES_PER_GRAM_PROTEIN +
      totalFat * CALORIES_PER_GRAM_FAT +
      totalCarbs * CALORIES_PER_GRAM_CARBS

    const caloriesPerServing = totalCalories / recipe.servings

    // Keto ratio: fat / (protein + carbs)
    const ketoRatio = totalFat / (totalProtein + totalCarbs) || 0

    return {
      totalProtein: parseFloat(totalProtein.toFixed(1)),
      totalFat: parseFloat(totalFat.toFixed(1)),
      totalCarbs: parseFloat(totalCarbs.toFixed(1)),
      totalCalories: Math.round(totalCalories),
      caloriesPerServing: Math.round(caloriesPerServing),
      ketoRatio: parseFloat(ketoRatio.toFixed(2)),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.ingredients.length === 0) {
      alert('Please add at least one ingredient')
      return
    }

    try {
      if (editingRecipe) {
        // Update existing recipe
        await fetch(`/api/recipes/${editingRecipe.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new recipe
        await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      setFormData({
        name: '',
        instructions: '',
        servings: '1',
        ingredients: [],
      })
      setShowForm(false)
      setEditingRecipe(null)
      setViewingRecipe(null)
      fetchRecipes()
    } catch (error) {
      console.error('Failed to save recipe:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
      await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      })
      setViewingRecipe(null)
      fetchRecipes()
    } catch (error) {
      console.error('Failed to delete recipe:', error)
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      name: recipe.name,
      instructions: recipe.instructions,
      servings: recipe.servings.toString(),
      ingredients: recipe.ingredients.map((ing) => ({
        foodItemId: ing.foodItem.id,
        grams: ing.grams.toString(),
      })),
    })
    setViewingRecipe(null)
    setShowForm(true)
  }

  const addIngredient = () => {
    if (foodItems.length === 0) {
      alert('Please add food items first!')
      return
    }
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { foodItemId: foodItems[0].id, grams: '' }],
    })
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    })
  }

  const getKetoRatioColor = (ratio: number): string => {
    const diff = Math.abs(ratio - targetRatio)
    if (diff <= 0.5) return 'text-green-600'
    if (diff <= 1.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const updateIngredientQuantity = (ingredientId: string, newGrams: number) => {
    if (!viewingRecipe) return

    setViewingRecipe({
      ...viewingRecipe,
      ingredients: viewingRecipe.ingredients.map((ing) =>
        ing.id === ingredientId ? { ...ing, grams: newGrams } : ing
      ),
    })
    setIsEditingQuantities(true)
  }

  const saveQuantityChanges = async () => {
    if (!viewingRecipe) return

    setIsSavingQuantities(true)
    try {
      const ingredients = viewingRecipe.ingredients.map((ing) => ({
        foodItemId: ing.foodItem.id,
        grams: ing.grams.toString(),
      }))

      await fetch(`/api/recipes/${viewingRecipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: viewingRecipe.name,
          instructions: viewingRecipe.instructions,
          servings: viewingRecipe.servings.toString(),
          ingredients,
        }),
      })

      // Refresh the recipes list to update the cards
      await fetchRecipes()
      setIsEditingQuantities(false)
    } catch (error) {
      console.error('Failed to save quantity changes:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSavingQuantities(false)
    }
  }

  const cancelQuantityChanges = () => {
    // Reset to the original recipe from the recipes list
    const originalRecipe = recipes.find((r) => r.id === viewingRecipe?.id)
    if (originalRecipe) {
      setViewingRecipe(originalRecipe)
    }
    setIsEditingQuantities(false)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (viewingRecipe) {
    const macros = calculateMacros(viewingRecipe)
    return (
      <div>
        <button
          onClick={() => setViewingRecipe(null)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Recipes
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{viewingRecipe.name}</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Nutritional Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Protein</div>
                <div className="text-2xl font-bold text-blue-600">{macros.totalProtein}g</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Fat</div>
                <div className="text-2xl font-bold text-yellow-600">{macros.totalFat}g</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Carbs</div>
                <div className="text-2xl font-bold text-red-600">{macros.totalCarbs}g</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Calories</div>
                <div className="text-2xl font-bold text-purple-600">{macros.totalCalories}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Servings</div>
                <div className="text-2xl font-bold text-green-600">{viewingRecipe.servings}</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Calories/Serving</div>
                <div className="text-2xl font-bold text-indigo-600">{macros.caloriesPerServing}</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Keto Ratio</div>
                  <div className={`text-3xl font-bold ${getKetoRatioColor(macros.ketoRatio)}`}>
                    {macros.ketoRatio}:1
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Target Ratio</div>
                  <div className="text-2xl font-semibold text-gray-700">{targetRatio}:1</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Fat: {macros.totalFat}g ÷ (Protein: {macros.totalProtein}g + Carbs: {macros.totalCarbs}g) = {macros.ketoRatio}:1
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Ingredients</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Food Item
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Protein (g)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fat (g)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carbs (g)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {viewingRecipe.ingredients.map((ing) => {
                    const multiplier = ing.grams / 100
                    const protein = (ing.foodItem.protein * multiplier).toFixed(1)
                    const fat = (ing.foodItem.fat * multiplier).toFixed(1)
                    const carbs = (ing.foodItem.carbs * multiplier).toFixed(1)

                    return (
                      <tr key={ing.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {ing.foodItem.name}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={ing.grams}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                updateIngredientQuantity(ing.id, value)
                              }}
                              className="w-20 px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            />
                            <span className="text-gray-600">g</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {protein}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {fat}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {carbs}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {isEditingQuantities && session && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={saveQuantityChanges}
                  disabled={isSavingQuantities}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSavingQuantities ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={cancelQuantityChanges}
                  disabled={isSavingQuantities}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Instructions</h3>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700">
              {viewingRecipe.instructions}
            </div>
          </div>

          {session && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleEdit(viewingRecipe)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Recipe
              </button>
              <button
                onClick={() => handleDelete(viewingRecipe.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Recipe
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recipes</h2>
        {!showForm && session && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Recipe
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="e.g., Keto Breakfast Bowl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Servings
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients
              </label>
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={ing.foodItemId}
                    onChange={(e) => updateIngredient(index, 'foodItemId', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    {foodItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Grams"
                    value={ing.grams}
                    onChange={(e) => updateIngredient(index, 'grams', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Ingredient
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                required
                rows={6}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Describe how to prepare this recipe..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {editingRecipe ? 'Update Recipe' : 'Add Recipe'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingRecipe(null)
                  setFormData({
                    name: '',
                    instructions: '',
                    servings: '1',
                    ingredients: [],
                  })
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No recipes yet. Add your first recipe to get started!
          </div>
        ) : (
          recipes.map((recipe) => {
            const macros = calculateMacros(recipe)
            return (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setViewingRecipe(recipe)}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {recipe.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servings:</span>
                    <span className="font-medium text-gray-900">{recipe.servings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories/serving:</span>
                    <span className="font-medium text-gray-900">{macros.caloriesPerServing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Keto Ratio:</span>
                    <span className={`font-bold ${getKetoRatioColor(macros.ketoRatio)}`}>
                      {macros.ketoRatio}:1
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Protein: {macros.totalProtein}g</span>
                      <span>Fat: {macros.totalFat}g</span>
                      <span>Carbs: {macros.totalCarbs}g</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
