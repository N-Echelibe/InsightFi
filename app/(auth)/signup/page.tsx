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

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Please enter your first name.'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Please enter your last name.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You need to agree to the terms to continue.'
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

    const firstName = formData.firstName.trim()
    const lastName = formData.lastName.trim()
    const fullName = `${firstName} ${lastName}`.trim()
    const email = formData.email.trim()
    const university = formData.university.trim()

    const { data, error } = await supabase.auth.signUp({
      email,
      password: formData.password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          university,
        },
      },
    })

    if (error) {
      setSubmitMessage({ type: 'error', text: error.message })
      setIsLoading(false)
      return
    }

    if (data.user?.id) {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          user_id: data.user.id,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          email,
          university: university || null,
        },
        { onConflict: 'user_id' }
      )

      if (profileError) {
        setSubmitMessage({
          type: 'error',
          text: `Account created, but we couldn't finish your profile: ${profileError.message}`,
        })
        setIsLoading(false)
        return
      }
    }

    setSubmitMessage({
      type: 'success',
      text: data.session
        ? 'Account created. Taking you to your dashboard.'
        : 'Account created. Check your email to confirm your account.',
    })
    setIsLoading(false)

    if (data.session) {
      router.replace('/')
      router.refresh()
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create your InsightFi account"
        description="Start tracking your spending, budgets, and savings as a student."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

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

          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <div className="space-y-2">
            <Label htmlFor="university">University name (optional)</Label>
            <Input
              id="university"
              name="university"
              type="text"
              placeholder="Your university"
              value={formData.university}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({
                  ...prev,
                  agreeToTerms: checked === true,
                }))
              }}
              className="mt-1"
            />
            <Label
              htmlFor="agreeToTerms"
              className="font-normal cursor-pointer text-sm leading-relaxed"
            >
              I agree to the terms and privacy policy
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-destructive">{errors.agreeToTerms}</p>
          )}

          {submitMessage && (
            <FormMessage type={submitMessage.type} message={submitMessage.text} />
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
