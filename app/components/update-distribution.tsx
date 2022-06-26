import { BigNumber, ethers } from 'ethers';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useContractWrite } from 'wagmi';

import contracts from '../config/contracts';
import { generateRoot, generateTree } from '../utils/merkle-tree';

interface Commitment {
  username: string;
  public_id: string;
}

const UpdateDistribution = () => {
  const [distributionAddress, setDistributionAddress] = useState<string>("");
  const { data: distribution, refetch: fetchDistribution } = useQuery(
    "distribution",
    async () => {
      const distro = await fetch(`/api/distributions/${distributionAddress}`);
      return distro.json();
    },
    { enabled: false }
  );
  const { data: commitments, refetch: fetchCommitments } = useQuery(
    "commitments",
    async () => {
      const commitments = await fetch(
        `/api/distributions/${distributionAddress}/commitments`
      );
      return commitments.json();
    },
    { enabled: false }
  );
  const {
    writeAsync: updateRoot,
    isLoading: updateRootIsLoading,
    isSuccess: updateRootIsSuccess,
  } = useContractWrite(
    {
      addressOrName: distributionAddress,
      contractInterface: contracts.tree.abi,
    },
    "updateRoot"
  );

  const onDistributionAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDistributionAddress(e.target.value);
  };

  const formatId = (id: string) => {
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
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
              <p>Claim address: {distribution.claimAddress}</p>
            </div>
            <div className="mb-4">
              <p className="font-bold">Repository:</p>
              <p>{distribution.repo}</p>
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
              onClick={() => {
                fetchDistribution();
                fetchCommitments();
              }}
            >
              OK
            </button>
          </div>
        )}
        {commitments && (
          <div>
            <div className="mb-4">
              <p className="font-bold">Commitments:</p>
              <p>{commitments.commitments.length} registered contributors.</p>
            </div>
            <table className="mb-4 rounded-md border border-zinc-600 border-separate border-spacing-x-2">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Public ID</th>
                </tr>
              </thead>
              <tbody>
                {commitments.commitments.map((c: Commitment) => {
                  return (
                    <tr key={c.public_id}>
                      <td>{c.username}</td>
                      <td>{formatId(c.public_id)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              className={`py-2 px-4 bg-${
                updateRootIsSuccess ? "green" : "blue"
              }-500 text-white font-bold rounded-xl hover:cursor-pointer ${
                updateRootIsSuccess ? "" : "hover:bg-blue-600"
              }`}
              onClick={async () => {
                const newTree = generateTree(commitments.commitments);
                await updateRoot({
                  args: [BigNumber.from(newTree.root.val)],
                });
              }}
            >
              {updateRootIsLoading && "Updating..."}
              {updateRootIsSuccess && "Tree Updated"}
              {!updateRootIsLoading &&
                !updateRootIsSuccess &&
                "Update Merkle Tree"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateDistribution;
