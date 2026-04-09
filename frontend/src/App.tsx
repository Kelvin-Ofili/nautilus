import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { PortalShell } from './components/PortalShell'

const Dashboard = lazy(() => import('./app/page'))
const Holdings = lazy(() => import('./app/holdings/page'))
const Distributions = lazy(() => import('./app/distributions/page'))
const Securities = lazy(() => import('./app/securities/page'))
const SecurityDetail = lazy(() => import('./app/securities/[id]/page'))
const Notices = lazy(() => import('./app/notices/page'))

function Loading() {
  return (
    <div className="text-text-secondary flex items-center gap-3 p-8">
      <span className="inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      Loading…
    </div>
  )
}

function NotFound() {
  return (
    <div className="text-center py-12">
      <p className="text-4xl mb-4">404</p>
      <p className="text-text-secondary mb-6">Page not found</p>
      <a href="/" className="btn-primary">
        ← Back to Dashboard
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PortalShell>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/distributions" element={<Distributions />} />
            <Route path="/securities" element={<Securities />} />
            <Route path="/securities/:id" element={<SecurityDetail />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PortalShell>
    </BrowserRouter>
  )
}
