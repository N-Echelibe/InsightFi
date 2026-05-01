import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface FormMessageProps {
  type: 'error' | 'success'
  message: string
}

export default function FormMessage({ type, message }: FormMessageProps) {
  const isError = type === 'error'
  const Icon = isError ? AlertCircle : CheckCircle2

  return (
    <div
      className={`rounded-md p-4 flex items-start gap-3 ${
        isError ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
      }`}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
