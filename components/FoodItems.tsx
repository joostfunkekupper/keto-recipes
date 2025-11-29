'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface FoodItem {
  id: string
  name: string
  protein: number
  fat: number
  carbs: number
}

interface UploadResult {
  success: boolean
  imported?: number
  total?: number
  errors?: string[]
  error?: string
}

export default function FoodItems() {
  const { data: session } = useSession()
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    protein: '',
    fat: '',
    carbs: '',
  })
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchFoodItems()
  }, [])

  const fetchFoodItems = async () => {
    try {
      const res = await fetch('/api/food-items')
      const data = await res.json()
      setFoodItems(data)
    } catch (error) {
      console.error('Failed to fetch food items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingItem) {
        // Update existing item
        await fetch(`/api/food-items/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new item
        await fetch('/api/food-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      setFormData({ name: '', protein: '', fat: '', carbs: '' })
      setShowForm(false)
      setEditingItem(null)
      fetchFoodItems()
    } catch (error) {
      console.error('Failed to save food item:', error)
    }
  }

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      protein: item.protein.toString(),
      fat: item.fat.toString(),
      carbs: item.carbs.toString(),
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food item?')) return

    try {
      await fetch(`/api/food-items/${id}`, {
        method: 'DELETE',
      })
      fetchFoodItems()
    } catch (error) {
      console.error('Failed to delete food item:', error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({ name: '', protein: '', fat: '', carbs: '' })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/food-items/bulk-upload', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()
      setUploadResult(result)

      if (result.success) {
        fetchFoodItems()
      }
    } catch (error) {
      console.error('Failed to upload CSV:', error)
      setUploadResult({
        success: false,
        error: 'Failed to upload file',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Food Items</h2>
        {!showForm && session && (
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add Food Item
            </button>
          </div>
        )}
      </div>

      {uploadResult && (
        <div className={`mb-6 p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {uploadResult.success ? (
            <div>
              <h3 className="font-semibold text-green-800 mb-2">Upload Successful!</h3>
              <p className="text-green-700">
                Imported {uploadResult.imported} of {uploadResult.total} items
              </p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-green-600 hover:text-green-800">
                    View {uploadResult.errors.length} errors/warnings
                  </summary>
                  <ul className="mt-2 text-xs text-gray-600 space-y-1 ml-4">
                    {uploadResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </details>
              )}
              <button
                onClick={() => setUploadResult(null)}
                className="mt-2 text-sm text-green-600 hover:text-green-800"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Upload Failed</h3>
              <p className="text-red-700">{uploadResult.error}</p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <ul className="mt-2 text-sm text-red-600 space-y-1 ml-4">
                  {uploadResult.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setUploadResult(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="e.g., Full cream milk"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protein (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fat (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carbs (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {editingItem ? 'Update' : 'Add'} Food Item
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Food Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Protein (g)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fat (g)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carbs (g)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {foodItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No food items yet. Add your first food item to get started!
                </td>
              </tr>
            ) : (
              foodItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {item.protein}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {item.fat}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {item.carbs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {session && (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
