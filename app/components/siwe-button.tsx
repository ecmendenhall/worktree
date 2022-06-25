import { getCsrfToken, signIn } from 'next-auth/react';
import { SiweMessage } from 'siwe';
import { useAccount, useNetwork, useSignMessage } from 'wagmi';

import Connect from './connect';

const SiweButton = () => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { signMessageAsync } = useSignMessage();

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

  if (account) {
    return (
      <button
        className="py-4 px-8 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
        onClick={handleLogin}
      >
        Sign in with Ethereum
      </button>
    );
  } else {
    return <p>Connect your wallet to create a distribution.</p>;
  }
};

export default SiweButton;
