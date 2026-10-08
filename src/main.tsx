import ReactDOM from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HelmetProvider>
    <PrimeReactProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </PrimeReactProvider>
  </HelmetProvider>,
)