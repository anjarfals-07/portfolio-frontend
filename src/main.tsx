import ReactDOM from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api'
import App from './App'
import { AuthProvider } from '@/context/AuthContext'

// ===== PrimeReact CSS =====
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// ===== Custom CSS =====
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <PrimeReactProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </PrimeReactProvider>,
)