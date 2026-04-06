'use client'

type ConfirmSubmitButtonProps = {
  label: string
  className?: string
  confirmMessage?: string
}

export default function ConfirmSubmitButton({
  label,
  className = '',
  confirmMessage = 'Are you sure?',
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      {label}
    </button>
  )
}

