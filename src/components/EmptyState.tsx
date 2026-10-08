import { Button } from 'primereact/button'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  actionIcon?: string
  onAction?: () => void
  actionLink?: string
  variant?: 'default' | 'admin' | 'compact'
  children?: ReactNode
}

function EmptyState({
  icon = 'pi pi-inbox',
  title,
  description,
  actionLabel,
  actionIcon = 'pi pi-plus',
  onAction,
  actionLink,
  variant = 'default',
  children,
}: EmptyStateProps) {
  const ActionButton = () => {
    if (!actionLabel) return null

    const button = (
      <Button label={actionLabel} icon={actionIcon} onClick={onAction} />
    )

    if (actionLink && !onAction) {
      return <Link to={actionLink}>{button}</Link>
    }

    return button
  }

  return (
    <div className={`empty-state empty-state-${variant}`}>
      <div className="empty-state-icon">
        <i className={icon}></i>
      </div>

      <h3 className="empty-state-title">{title}</h3>

      {description && <p className="empty-state-desc">{description}</p>}

      {children}

      {actionLabel && (
        <div className="empty-state-actions">
          <ActionButton />
        </div>
      )}
    </div>
  )
}

export default EmptyState