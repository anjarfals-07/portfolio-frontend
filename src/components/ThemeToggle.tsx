import { Button } from 'primereact/button'
import { useTheme } from '@/context/ThemeContext'

interface ThemeToggleProps {
  variant?: 'default' | 'text' | 'icon-only'
}

function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const icon = isDark ? 'pi pi-sun' : 'pi pi-moon'
  const label = isDark ? 'Light' : 'Dark'

  if (variant === 'icon-only') {
    return (
      <Button
        icon={icon}
        rounded
        text
        severity={isDark ? 'warning' : 'secondary'}
        onClick={toggleTheme}
        tooltip={isDark ? 'Light Mode' : 'Dark Mode'}
        tooltipOptions={{ position: 'bottom' }}
        aria-label="Toggle theme"
        className="theme-toggle-btn"
      />
    )
  }

  if (variant === 'text') {
    return (
      <Button
        label={label}
        icon={icon}
        text
        severity={isDark ? 'warning' : 'secondary'}
        onClick={toggleTheme}
        aria-label="Toggle theme"
      />
    )
  }

  return (
    <Button
      icon={icon}
      rounded
      text
      severity={isDark ? 'warning' : 'secondary'}
      onClick={toggleTheme}
      tooltip={isDark ? 'Light Mode' : 'Dark Mode'}
      tooltipOptions={{ position: 'bottom' }}
      aria-label="Toggle theme"
      className="theme-toggle-btn"
    />
  )
}

export default ThemeToggle