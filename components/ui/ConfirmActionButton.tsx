'use client'

import React from 'react'

export default function ConfirmActionButton({
  action,
  confirmText,
  className,
  style,
  children,
  disabled,
}: {
  action: (formData: FormData) => Promise<void>
  confirmText: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      formAction={action}
      className={className}
      style={style}
      disabled={disabled}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
