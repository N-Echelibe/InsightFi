'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/auth/auth-layout'
import AuthCard from '@/components/auth/auth-card'
import PasswordField from '@/components/auth/password-field'
import FormMessage from '@/components/auth/form-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Please enter your password.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    setSubmitMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    })

    if (error) {
      setSubmitMessage({ type: 'error', text: error.message })
      setIsLoading(false)
      return
    }

    const nextPath = new URLSearchParams(window.location.search).get('next')
    router.replace(nextPath || '/')
    router.refresh()
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to continue managing your student finances."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <PasswordField
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({
                  ...prev,
                  rememberMe: checked === true,
                }))
              }}
            />
            <Label htmlFor="rememberMe" className="font-normal cursor-pointer">
              Remember me
            </Label>
          </div>

          {submitMessage && (
            <FormMessage type={submitMessage.type} message={submitMessage.text} />
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <Link
            href="/forgot-password"
            className="block text-primary hover:underline"
          >
            Forgot password?
          </Link>
          <div className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
