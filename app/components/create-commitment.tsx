import { ethers } from "ethers";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";

import GenerateSecrets, { ZKData } from "./generate-secrets";

interface Props {
  user: string;
}

interface Commitment {
  distributionAddress: string;
  username: string;
  publicId: string;
}

const saveCommitment = async (commitment: Commitment) => {
  const { distributionAddress, username, publicId } = commitment;
  const res = await fetch(
    `/api/distributions/${distributionAddress}/commitments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, publicId }),
    }
  );
  return res.status;
};

const CreateCommitment = ({ user }: Props) => {
  const [distributionAddress, setDistributionAddress] = useState<string>("");
  const [commitment, setCommitment] = useState<string>();
  const [commitmentSaved, setCommitmentSaved] = useState<boolean>();
  const { data: distribution, refetch: fetchDistribution } = useQuery(
    "distribution",
    async () => {
      const distro = await fetch(`/api/distributions/${distributionAddress}`);
      return distro.json();
    },
    { enabled: false }
  );
  const save = useMutation(saveCommitment, {
    onSuccess: () => {
      setCommitmentSaved(true);
    },
  });

  const onDownloaded = (data: ZKData) => {
    setCommitment(data.publicId);
  };

  const onDistributionAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDistributionAddress(e.target.value);
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
              <p>
                {distribution.isContributor
                  ? "✅ You are a contributor"
                  : "🚫 You are not a contributor"}
              </p>
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
        {distribution?.isContributor && (
          <GenerateSecrets
            address={distributionAddress}
            onDownloaded={onDownloaded}
          />
        )}
        {commitment && (
          <div>
            <button
              className={`py-2 px-4 bg-${
                save.isSuccess ? "green" : "blue"
              }-500 text-white font-bold rounded-xl hover:cursor-pointer ${
                save.isSuccess ? "" : "hover:bg-blue-600"
              }`}
              onClick={() => {
                if (!commitmentSaved) {
                  save.mutate({
                    distributionAddress,
                    username: user,
                    publicId: commitment,
                  });
                }
              }}
            >
              {save.isLoading && "Saving..."}
              {save.isSuccess && "Registration complete"}
              {!save.isLoading && !save.isSuccess && "Complete Registration"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCommitment;
