import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export default function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-3 text-center">
        <div className="flex justify-center mb-2">
          <div className="text-2xl font-bold text-primary">InsightFi</div>
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
