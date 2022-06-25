import type { NextPage } from "next";
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import Head from 'next/head';
import { SiweMessage } from 'siwe';
import { useAccount, useNetwork, useSignMessage } from 'wagmi';

import { ConnectButton } from '@rainbow-me/rainbowkit';

const Create: NextPage = () => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const { data: session } = useSession();

  const handleLogin = async () => {
    if (account && activeChain) {
      try {
        const message = new SiweMessage({
          domain: window.location.host,
          address: account.address,
          statement: "Sign in to Worktree.",
          uri: window.location.origin,
          version: "1",
          chainId: activeChain.id,
          nonce: await getCsrfToken(),
        });
        const signature = await signMessageAsync({
          message: message.prepareMessage(),
        });
        signIn("credentials", {
          message: JSON.stringify(message),
          redirect: false,
          signature,
        });
      } catch (error) {
        window.alert(error);
      }
    }
  };

  return (
    <div>
      <main>
        <h1>Create a distribution</h1>
        <div>
          <ConnectButton />
          <button
            onClick={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            Sign in with Ethereum
          </button>
          <div>{JSON.stringify(session)}</div>
        </div>
      </main>
    </div>
  );
};

export default Create;
