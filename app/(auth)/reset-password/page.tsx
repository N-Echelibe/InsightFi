'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AuthLayout from '@/components/auth/auth-layout'
import AuthCard from '@/components/auth/auth-card'
import PasswordField from '@/components/auth/password-field'
import FormMessage from '@/components/auth/form-message'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password.trim()) {
      newErrors.password = 'New password is required.'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    // TODO: Connect password update logic here
    // This is a mock submission with loading state
    setTimeout(() => {
      setIsSubmitted(true)
      setIsLoading(false)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <AuthLayout>
        <AuthCard
          title="Password reset"
          description="Your password has been successfully updated."
        >
          <div className="space-y-6">
            <FormMessage
              type="success"
              message="Password reset placeholder. Connect password update logic here later."
            />

            <Button asChild className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create a new password"
        description="Choose a secure password for your InsightFi account."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="New password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <PasswordField
            label="Confirm new password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset password'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-primary hover:underline text-sm">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
