import { ThorinGlobalStyles, lightTheme } from '@ensdomains/thorin'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { AppProps } from 'next/app'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { WagmiConfig, WagmiProvider } from 'wagmi'

import { Layout } from '@/components/Layout'
import { useIsMounted } from '@/hooks/useIsMounted'

import { wagmiConfig } from '../providers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function App({ Component, pageProps }: AppProps) {
  const isMounted = useIsMounted()

  const queryClient = new QueryClient()

  return (
    <ThemeProvider theme={lightTheme}>
      <ThorinGlobalStyles />
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize="compact">
            <Layout>{isMounted && <Component {...pageProps} />}</Layout>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>

    </ThemeProvider>
  )
}
