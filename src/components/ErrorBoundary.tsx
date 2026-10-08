import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from 'primereact/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary-wrapper">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">
              <i className="pi pi-exclamation-triangle"></i>
            </div>

            <h1 className="error-boundary-title">Oops! Ada yang salah 😅</h1>

            <p className="error-boundary-desc">
              Terjadi error yang nggak terduga. Jangan panik, coba salah satu
              opsi di bawah.
            </p>

            <div className="error-boundary-actions">
              <Button
                label="Muat Ulang Halaman"
                icon="pi pi-refresh"
                onClick={this.handleReload}
                size="large"
              />
              <Button
                label="Kembali ke Home"
                icon="pi pi-home"
                severity="secondary"
                outlined
                size="large"
                onClick={this.handleReset}
              />
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary-details">
                <summary>Detail Error (Development)</summary>
                <pre className="error-boundary-pre">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary