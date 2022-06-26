import type { NextPage } from "next";
import { useAccount } from 'wagmi';

import ClaimDistribution from '../../components/claim-distribution';
import Connect from '../../components/connect';
import Full from '../../layouts/full';

const Claim: NextPage = () => {
  const { data: account } = useAccount();

  return (
    <div>
      <Full>
        <div>
          <Connect />
          <div className="py-8 px-16 bg-zinc-100 shadow-md rounded-md">
            <h2 className="text-center text-2xl text-green-600 font-bold mb-8">
              Claim contributor distribution
            </h2>
            <div className="flex flex-row place-content-center">
              {account ? (
                <ClaimDistribution />
              ) : (
                <p>Connect your wallet to claim.</p>
              )}
            </div>
          </div>
        </div>
      </Full>
    </div>
  );
};

export default Claim;
