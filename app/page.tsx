'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import FoodItems from '@/components/FoodItems'
import Recipes from '@/components/Recipes'
import Profile from '@/components/Profile'
import About from '@/components/About'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'food-items' | 'recipes' | 'my-recipes' | 'profile' | 'about'>('recipes')

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Auth Bar */}
        <div className="flex justify-end mb-4">
          {status === 'loading' ? (
            <div className="text-gray-600">Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700">
                Welcome, <span className="font-semibold">{session.user?.name}</span>
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/auth/signin')}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm border border-gray-300"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Register
              </button>
            </div>
          )}
        </div>

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
              onClick={() => setActiveTab('food-items')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'food-items'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Food Items
            </button>
            {session && (
              <>
                <button
                  onClick={() => setActiveTab('my-recipes')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'my-recipes'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  My Recipes
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'about'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'about' && <About />}
          {activeTab === 'food-items' && <FoodItems />}
          {activeTab === 'recipes' && <Recipes recipeType="public" />}
          {activeTab === 'my-recipes' && <Recipes recipeType="my" />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  )
}
