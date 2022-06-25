import { randomBytes } from 'crypto';
import {
    formatBytes32String, getAddress, getCreate2Address, keccak256, parseUnits
} from 'ethers/lib/utils';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useContractEvent, useContractWrite, useToken } from 'wagmi';

import contracts from '../config/contracts';

const getSalt = () => {
  return `0x${randomBytes(32).toString("hex")}`;
};

const CreateDistribution = () => {
  const [salt] = useState(getSalt());
  const [repoName, setRepoName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [amountPerContributor, setAmountPerContributor] = useState("");
  const [amountComplete, setAmountComplete] = useState(false);
  const [treeAddress, setTreeAddress] = useState("");
  const [claimAddress, setClaimAddress] = useState("");
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
  const {
    isLoading: createDistributionIsLoading,
    data: createDistributionResponse,
    write: createDistribution,
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
    <div className="flex flex-col">
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
            <div>
              <p className="font-bold">Distribution deployed:</p>
              <p>Worktree: {treeAddress}</p>
              <p>Claim module: {claimAddress}</p>
            </div>
          ) : (
            <button
              className="py-2 px-4 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
              onClick={async () => {
                createDistribution({
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
    </div>
  );
};

export default CreateDistribution;
