import { randomBytes } from 'crypto';
import { ethers } from 'ethers';
import { formatBytes32String, parseUnits } from 'ethers/lib/utils';
import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useContractEvent, useContractWrite, useToken } from 'wagmi';

import contracts from '../config/contracts';

interface Props {
  chainId: number;
}

interface Distribution {
  treeAddress: string;
  claimAddress: string;
  chainId: number;
}

const getSalt = () => {
  return `0x${randomBytes(32).toString("hex")}`;
};

const saveDistribution = async (distribution: Distribution) => {
  const { treeAddress, claimAddress, chainId } = distribution;
  const res = await fetch("/api/distributions/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ treeAddress, claimAddress, chainId }),
  });
  return res.status;
};

const CreateDistribution = ({ chainId }: Props) => {
  const [salt] = useState(getSalt());
  const [repoName, setRepoName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [amountPerContributor, setAmountPerContributor] = useState("");
  const [amountComplete, setAmountComplete] = useState(false);
  const [treeAddress, setTreeAddress] = useState("");
  const [claimAddress, setClaimAddress] = useState("");
  const [distributionSaved, setDistributionSaved] = useState(false);
  const { data: token, refetch: fetchToken } = useToken({
    address: tokenAddress,
    enabled: false,
  });
  const {
    isLoading: repoIsLoading,
    error: repoError,
    data: repo,
    refetch: fetchRepo,
  } = useQuery(
    "repo",
    async () => {
      const repo = await fetch(`https://api.github.com/repos/${repoName}`);
      return repo.json();
    },
    { enabled: false }
  );
  const save = useMutation(saveDistribution, {
    onSuccess: () => {
      setDistributionSaved(true);
    },
  });
  const {
    isLoading: createDistributionIsLoading,
    data: createDistributionResponse,
    writeAsync: createDistribution,
  } = useContractWrite(
    {
      addressOrName: contracts.factory.address,
      contractInterface: contracts.factory.abi,
    },
    "createERC20"
  );
  useContractEvent(
    {
      addressOrName: contracts.factory.address,
      contractInterface: contracts.factory.abi,
    },
    "NewTree",
    (event) => {
      console.log("Event: ", event);
      const [createdSalt, treeAddress, claimAddress] = event;
      console.log(salt, createdSalt, treeAddress, claimAddress);
      if (createdSalt === salt) {
        setTreeAddress(treeAddress);
        setClaimAddress(claimAddress);
        save.mutate({
          treeAddress,
          claimAddress,
          chainId,
        });
      }
    }
  );

  const onRepoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoName(e.target.value);
  };

  const onTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAddress(e.target.value);
  };

  const onAmountPerContributorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAmountPerContributor(e.target.value);
  };

  return (
    <div className="flex flex-col lg:w-1/2">
      <div className="mb-4">
        <label className="block font-bold" htmlFor="repository">
          Repository name:
        </label>
        {repo?.description ? (
          <div className="mb-4">
            <p>
              <a href={repo.html_url}>{repo.full_name}</a>
            </p>
            <p>{repo.description}</p>
          </div>
        ) : (
          <div>
            <input
              className="px-4 py-2 mr-4 rounded-md shadow-inner"
              type="text"
              placeholder="foundry-rs/foundry"
              id="repository"
              onChange={onRepoChange}
            />
            <button
              className="py-2 px-4 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
              onClick={() => fetchRepo()}
            >
              OK
            </button>
          </div>
        )}
      </div>
      {repo?.description && (
        <div className="mb-4">
          <label className="block font-bold" htmlFor="token">
            ERC20 token:
          </label>
          {token ? (
            <div className="mb-4">
              <p>
                {token.symbol}: <a>{token.address}</a>
              </p>
            </div>
          ) : (
            <div>
              <input
                className="px-4 py-2 mr-4 rounded-md shadow-inner"
                type="text"
                placeholder="0x6B175474E89094C44Da98b954EedeAC495271d0F"
                id="token"
                onChange={onTokenChange}
              />
              <button
                className="py-2 px-4 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
                onClick={() => fetchToken()}
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}
      {repo?.description && token?.symbol && (
        <div className="mb-4">
          <label className="block font-bold" htmlFor="amount">
            Amount per contributor:
          </label>
          {amountComplete ? (
            <div className="mb-4">
              <p>
                {amountPerContributor} {token?.symbol}
              </p>
            </div>
          ) : (
            <div>
              <input
                className="px-4 py-2 mr-4 rounded-md shadow-inner"
                type="number"
                placeholder="10"
                id="amount"
                onChange={onAmountPerContributorChange}
              />
              <button
                className="py-2 px-4 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
                onClick={() => setAmountComplete(true)}
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}
      {repo?.description && token?.symbol && amountComplete && (
        <div>
          {createDistributionResponse ? (
            <div className="mb-4">
              <p className="font-bold">Contract addresses:</p>
              <p>Worktree: {treeAddress}</p>
              <p>Claim module: {claimAddress}</p>
            </div>
          ) : (
            <button
              className="py-2 px-4 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
              onClick={async () => {
                await createDistribution({
                  args: [
                    salt,
                    formatBytes32String(""),
                    token.address,
                    parseUnits(amountPerContributor, token.decimals),
                  ],
                });
              }}
            >
              {createDistributionIsLoading ? "Deploying..." : "Deploy"}
            </button>
          )}
        </div>
      )}
      {distributionSaved && (
        <div className="w-1/4 text-center py-2 px-4 bg-green-500 text-white font-bold rounded-xl">
          Deployed
        </div>
      )}
    </div>
  );
};

export default CreateDistribution;
