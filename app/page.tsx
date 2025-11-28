'use client'

import { useState } from 'react'
import FoodItems from '@/components/FoodItems'
import Recipes from '@/components/Recipes'
import Settings from '@/components/Settings'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'food-items' | 'recipes' | 'settings'>('food-items')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Ketogenic Therapy Diet Recipes
          </h1>
          <p className="text-gray-600">
            Track macros and manage your keto recipes
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-white shadow-md p-1">
            <button
              onClick={() => setActiveTab('food-items')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'food-items'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Food Items
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'recipes'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Recipes
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'food-items' && <FoodItems />}
          {activeTab === 'recipes' && <Recipes />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  )
}
