import { ThorinGlobalStyles, lightTheme } from '@ensdomains/thorin'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { AppProps } from 'next/app'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { WagmiConfig, WagmiProvider } from 'wagmi'
import { QueryClientProvider } from "@tanstack/react-query";
import { Layout } from '@/components/Layout'
import { useIsMounted } from '@/hooks/useIsMounted'


import { Chain, http } from "viem";
import { sepolia } from "viem/chains";
import { createConfig } from "wagmi";
import { QueryClient } from "@tanstack/react-query";
import { injected, metaMask } from 'wagmi/connectors'

export const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
  ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
  },
  ccipRead: {
    // data is the binary calldata
    async request({ data, sender, urls }) {

      let url = urls?.[0];

      if (url === 'https://ccip-v2.ens.xyz') {
        const getUrl = url.replace('{sender}', sender).replace('{data}', data);

        return fetch(getUrl).then((res) => res.json());
      }

      return data;
    }
  }

});



export default function App({ Component, pageProps }: AppProps) {
  const isMounted = useIsMounted()

  return (
    <ThemeProvider theme={lightTheme}>
      <ThorinGlobalStyles />
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider initialChain={sepolia} modalSize="compact">
            <Layout>{isMounted && <Component {...pageProps} />}</Layout>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>

    </ThemeProvider >
  )
}
