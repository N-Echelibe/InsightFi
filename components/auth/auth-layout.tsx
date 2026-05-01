import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-background sm:flex sm:min-h-screen sm:items-center sm:justify-center sm:px-4 sm:py-12">
      <div className="min-h-dvh w-full sm:min-h-0 sm:max-w-md">
        {children}
      </div>
    </div>
  )
}
