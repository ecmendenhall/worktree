import { ethers } from 'ethers';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAccount, useContractWrite } from 'wagmi';

import contracts from '../config/contracts';
import useZKProof from '../hooks/zk-proof';

const ClaimDistribution = () => {
  const { data: account } = useAccount();
  const [distributionAddress, setDistributionAddress] = useState<string>("");
  const [key, setKey] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [generatingProof, setGeneratingProof] = useState<boolean>();
  const { data: distribution, refetch: fetchDistribution } = useQuery(
    "distribution",
    async () => {
      const distro = await fetch(`/api/distributions/${distributionAddress}`);
      return distro.json();
    },
    { enabled: false }
  );
  const claim = useContractWrite(
    {
      addressOrName: distributionAddress,
      contractInterface: contracts.tree.abi,
    },
    "claim"
  );
  const {
    generate: generateProof,
    isReady,
    isGenerating,
    proof,
    error,
  } = useZKProof({
    distributionAddress,
    key,
    secret,
    account: account?.address || undefined,
  });

  const onDistributionAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDistributionAddress(e.target.value);
  };

  const onKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value);
  };

  const onSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecret(e.target.value);
  };

  return (
    <div className="flex flex-col lg:w-3/4">
      <div className="mb-4">
        <label className="block font-bold" htmlFor="distribution">
          Distribution:
        </label>
        {distribution ? (
          <div>
            <div className="mb-4">
              <p>Tree address: {distributionAddress}</p>
            </div>
            <div className="mb-4">
              <p className="font-bold">Repository:</p>
              <p>{distribution.repo}</p>
            </div>
            <div className="mb-4">
              <label className="block font-bold" htmlFor="key">
                Key:
              </label>
              <input
                className="px-4 py-2 mr-4 rounded-md shadow-inner"
                type="text"
                placeholder={ethers.constants.AddressZero}
                id="key"
                onChange={onKeyChange}
              />
              <label className="block font-bold" htmlFor="secret">
                Secret:
              </label>
              <input
                className="px-4 py-2 mr-4 rounded-md shadow-inner"
                type="text"
                placeholder={ethers.constants.AddressZero}
                id="secret"
                onChange={onSecretChange}
              />
            </div>
          </div>
        ) : (
          <div>
            <input
              className="px-4 py-2 mr-4 rounded-md shadow-inner"
              type="text"
              placeholder={ethers.constants.AddressZero}
              id="distribution"
              onChange={onDistributionAddressChange}
            />
            <button
              className="py-2 px-4 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
              onClick={() => fetchDistribution()}
            >
              OK
            </button>
          </div>
        )}
        {distribution && (
          <div className="mb-4">
            <button
              className={`py-2 px-4 bg-${
                proof ? "green" : "blue"
              }-500 text-white font-bold rounded-xl hover:cursor-pointer ${
                proof ? "" : "hover:bg-blue-600"
              }`}
              onClick={() => {
                generateProof();
              }}
            >
              {isGenerating && "Generating..."}
              {proof && "Proof Generated"}
              {!proof && !isGenerating && isReady && "Generate Proof"}
            </button>
            {error?.message}
          </div>
        )}
        {proof && (
          <div>
            <button
              className={`py-2 px-4 bg-${
                claim.isSuccess ? "green" : "blue"
              }-500 text-white font-bold rounded-xl hover:cursor-pointer ${
                claim.isSuccess ? "" : "hover:bg-blue-600"
              }`}
              onClick={async () => {
                await claim.writeAsync({
                  args: [proof, key],
                  overrides: {
                    gasLimit: 20_000_000,
                  },
                });
              }}
            >
              {claim.isLoading && "Claiming..."}
              {claim.isSuccess && "Claimed"}
              {!claim.isLoading && !claim.isSuccess && "Claim Airdrop"}
            </button>
            {error?.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimDistribution;
