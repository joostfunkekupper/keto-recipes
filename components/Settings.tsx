'use client'

import { useState, useEffect } from 'react'

export default function Settings() {
  const [targetRatio, setTargetRatio] = useState<string>('3.0')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/preferences')
      const data = await res.json()
      setTargetRatio(data.targetRatio.toString())
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRatio: parseFloat(targetRatio) }),
      })
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Failed to save settings')
      console.error('Failed to save preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Target Ketogenic Ratio
            </label>
            <p className="text-sm text-gray-600 mb-4">
              The target keto ratio is the desired proportion of fat to protein + carbohydrates.
              For example, a 3:1 ratio means 3 parts fat to 1 part protein+carbs.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                required
                value={targetRatio}
                onChange={(e) => setTargetRatio(e.target.value)}
                className="w-32 px-4 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
              <span className="text-lg font-medium text-gray-700">: 1</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Common Ketogenic Ratios:</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li><strong>4:1</strong> - Classic therapeutic ketogenic diet (strictest)</li>
              <li><strong>3:1</strong> - Modified ketogenic diet (common for therapy)</li>
              <li><strong>2:1</strong> - Less restrictive ketogenic diet</li>
              <li><strong>1:1</strong> - Modified Atkins diet approach</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          {message && (
            <div
              className={`p-3 rounded-lg text-center ${
                message.includes('success')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message}
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">About Ketogenic Ratios</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              The ketogenic ratio indicates how many grams of fat there are for every gram of
              protein plus carbohydrates combined.
            </p>
            <p>
              <strong>Formula:</strong> Keto Ratio = Fat (g) ÷ (Protein (g) + Carbs (g))
            </p>
            <p>
              Higher ratios (like 4:1) are used for therapeutic purposes such as epilepsy management,
              while lower ratios (like 2:1 or 3:1) are more common for modified ketogenic diets.
            </p>
            <p>
              Your recipes will display their calculated keto ratio, color-coded based on how close
              they are to your target ratio.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
