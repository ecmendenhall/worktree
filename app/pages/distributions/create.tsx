import type { NextPage } from "next";
import { useSession } from 'next-auth/react';
import { useNetwork } from 'wagmi';

import Connect from '../../components/connect';
import CreateDistribution from '../../components/create-distribution';
import SiweButton from '../../components/siwe-button';
import Full from '../../layouts/full';

const Create: NextPage = () => {
  const { activeChain: chain } = useNetwork();
  const { data: session } = useSession();

  return (
    <div>
      <Full>
        <div>
          <Connect />
          <div className="py-8 px-16 bg-zinc-100 shadow-md rounded-md">
            <h2 className="text-center text-2xl text-green-600 font-bold mb-8">
              Create a distribution
            </h2>
            <div className="flex flex-row place-content-center">
              {session?.user.address && chain?.id ? (
                <CreateDistribution chainId={chain.id} />
              ) : (
                <SiweButton />
              )}
            </div>
          </div>
        </div>
      </Full>
    </div>
  );
};

export default Create;
