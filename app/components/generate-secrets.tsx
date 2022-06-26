import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { pedersenHashConcat, toHex } from "zkp-merkle-airdrop-lib";

import downloadFile, { DownloadType } from "../utils/downloads";
import generateHashSeed from "../utils/generate-hash-seed";
import HashSlider, {
  onChangePayload as onHashChangePayload,
} from "./hash-slider";

interface Props {
  address?: string;
  onDownloaded?: (data: ZKData) => void;
}

export interface ZKData {
  privateKey: string;
  secret: string;
  publicId: string;
}

const GenerateSecrets = ({ address, onDownloaded }: Props) => {
  const [keySecretPair, setKeySecretPair] = useState<[string, string]>();
  const key = keySecretPair?.[0];
  const secret = keySecretPair?.[1];
  const [secretHashSeed, setSecretHashSeed] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    generateHashSeed().then(setSecretHashSeed);
  }, []);

  // reset downloaded if the keySecretPair change
  useEffect(() => {
    setDownloaded(false);
  }, [key, secret]);

  const handleHashChange = useCallback(
    ({ hash: newKey, mouseInput, progress }: onHashChangePayload) => {
      const secretInput = [
        secretHashSeed || newKey,
        ...mouseInput.split("").reverse(),
      ].join("");

      // reset to avoid reuse
      if (secretHashSeed) {
        setSecretHashSeed(undefined);
      }

      const newSecret = ethers.utils.id(secretInput);
      setKeySecretPair([newKey, newSecret]);
      setProgress(progress);
    },
    [secretHashSeed]
  );

  const handleDownloadClick = () => {
    if (key && secret) {
      const publicId = toHex(pedersenHashConcat(BigInt(key), BigInt(secret)));
      const data: ZKData = { privateKey: key, secret, publicId };
      downloadFile(
        `worktree-${address}-airdrop-key-and-secret`,
        JSON.stringify(data),
        DownloadType.JSON
      );
      setDownloaded(true);
      onDownloaded?.(data);
    }
  };

  return (
    <div>
      <div className="flex flex-col">
        <p className="font-bold">Secret keys:</p>
        <div className="mb-4 flex flex-col">
          <p>
            Move your cursor in any direction while dragging the slider to
            generate a new key and secret. Once the progress bar is completely
            full, download the JSON file containing your new key and secret
            before continuing to the next step.
          </p>
        </div>
        <HashSlider
          className="mb-2"
          distanceRequirement={2000}
          onChange={handleHashChange}
        />
        <p>Key: {key}</p>
        <p>Secret: {secret}</p>
        <div className="ml-auto">
          <button
            className="py-2 px-4 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
            onClick={handleDownloadClick}
            disabled={!keySecretPair || progress < 100}
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateSecrets;
