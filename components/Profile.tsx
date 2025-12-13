'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  username: string
  email: string | null
  createdAt: string
}

export default function Profile() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Email form state
  const [email, setEmail] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')

  // Target ratio state
  const [targetRatio, setTargetRatio] = useState<string>('3.0')
  const [isSavingRatio, setIsSavingRatio] = useState(false)
  const [ratioMessage, setRatioMessage] = useState<string>('')

  useEffect(() => {
    if (session) {
      fetchProfile()
      fetchPreferences()
    }
  }, [session])

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/preferences')
      const data = await res.json()
      setTargetRatio(data.targetRatio.toString())
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()

      if (res.ok) {
        setProfile(data)
        setEmail(data.email || '')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingEmail(true)
    setEmailMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setEmailMessage('Email updated successfully!')
        setProfile(data.user)
        setTimeout(() => setEmailMessage(''), 3000)
      } else {
        setEmailMessage(data.error || 'Failed to update email')
      }
    } catch (error) {
      setEmailMessage('Failed to update email')
      console.error('Email update error:', error)
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPassword(true)
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match')
      setIsUpdatingPassword(false)
      return
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordMessage('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordMessage(''), 3000)
      } else {
        setPasswordMessage(data.error || 'Failed to update password')
      }
    } catch (error) {
      setPasswordMessage('Failed to update password')
      console.error('Password update error:', error)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsDeleting(true)
    setDeleteMessage('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setDeleteMessage('Account deleted successfully. Signing out...')
        setTimeout(() => {
          signOut({ callbackUrl: '/' })
        }, 2000)
      } else {
        setDeleteMessage(data.error || 'Failed to delete account')
        setIsDeleting(false)
      }
    } catch (error) {
      setDeleteMessage('Failed to delete account')
      setIsDeleting(false)
      console.error('Account deletion error:', error)
    }
  }

  const handleUpdateRatio = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingRatio(true)
    setRatioMessage('')

    try {
      await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRatio: parseFloat(targetRatio) }),
      })
      setRatioMessage('Target ratio saved successfully!')
      setTimeout(() => setRatioMessage(''), 3000)
    } catch (error) {
      setRatioMessage('Failed to save target ratio')
      console.error('Failed to save preferences:', error)
    } finally {
      setIsSavingRatio(false)
    }
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Please sign in to view your profile.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Account Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600">Username</label>
            <p className="text-gray-900 font-medium">{profile?.username}</p>
            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Member Since</label>
            <p className="text-gray-900">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Update Email */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Update Email</h3>
        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="your.email@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={isUpdatingEmail}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {isUpdatingEmail ? 'Updating...' : 'Update Email'}
          </button>
          {emailMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                emailMessage.includes('success')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {emailMessage}
            </div>
          )}
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Change Password</h3>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {isUpdatingPassword ? 'Updating...' : 'Change Password'}
          </button>
          {passwordMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                passwordMessage.includes('success')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {passwordMessage}
            </div>
          )}
        </form>
      </div>

      {/* Target Keto Ratio */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Ketogenic Ratio Settings</h3>
        <form onSubmit={handleUpdateRatio} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Ketogenic Ratio
            </label>
            <p className="text-sm text-gray-600 mb-3">
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
            <h4 className="font-semibold text-gray-800 mb-2">Common Ketogenic Ratios:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li><strong>4:1</strong> - Classic therapeutic ketogenic diet (strictest)</li>
              <li><strong>3:1</strong> - Modified ketogenic diet (common for therapy)</li>
              <li><strong>2:1</strong> - Less restrictive ketogenic diet</li>
              <li><strong>1:1</strong> - Modified Atkins diet approach</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSavingRatio}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {isSavingRatio ? 'Saving...' : 'Save Target Ratio'}
          </button>

          {ratioMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                ratioMessage.includes('success')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {ratioMessage}
            </div>
          )}
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">About Ketogenic Ratios</h4>
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

      {/* Delete Account */}
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
        <h3 className="text-xl font-semibold mb-4 text-red-800">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Your recipes and food items will remain but will no longer be associated with your account.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold mb-2">
                Are you absolutely sure?
              </p>
              <p className="text-sm text-red-700">
                This action cannot be undone. Please enter your password to confirm.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletePassword('')
                  setDeleteMessage('')
                }}
                disabled={isDeleting}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:bg-gray-200"
              >
                Cancel
              </button>
            </div>
            {deleteMessage && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  deleteMessage.includes('success')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {deleteMessage}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
