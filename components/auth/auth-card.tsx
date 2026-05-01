import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export default function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="min-h-dvh w-full justify-center rounded-none border-0 py-8 shadow-none sm:min-h-0 sm:justify-start sm:rounded-xl sm:border sm:py-6 sm:shadow-sm">
      <CardHeader className="space-y-3 px-6 text-center sm:px-6">
        <div className="flex justify-center mb-2">
          <div className="text-2xl font-bold text-primary">InsightFi</div>
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-6 pb-8 sm:px-6 sm:pb-0">
        {children}
      </CardContent>
    </Card>
  )
}
