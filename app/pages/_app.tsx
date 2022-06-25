import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { SessionProvider } from 'next-auth/react';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import type { AppProps } from "next/app";

const { chains, provider } = configureChains(
  [chain.mainnet, chain.optimism],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Worktree",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
