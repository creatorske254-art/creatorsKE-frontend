import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import AppRouter from '@/routes/index'

import '@/index.css'

// ─── TanStack Query client ─────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          60 * 1000,  // 1 minute before refetch
      retry:              1,
      refetchOnWindowFocus: false,    // don't hammer the API on tab switch
    },
    mutations: {
      // Global mutation error handled per-feature via toast; no default here
    },
  },
})

// ─── Root ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>

      {/* Auth must wrap everything — contexts below it may read auth state */}
      <AuthProvider>
        <NotificationProvider>

          {/* Single Toaster instance — all features call toast() from sonner */}
          <Toaster
            position="top-right"
            duration={4000}
            richColors
            closeButton
          />

          <AppRouter />

        </NotificationProvider>
      </AuthProvider>

      {/* Dev tools — the package already no-ops itself outside dev via
          process.env.NODE_ENV, but gate it explicitly too so it's never
          ambiguous whether a "dev thing" can reach production. */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}

    </QueryClientProvider>
  </React.StrictMode>
)
