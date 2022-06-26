import { useCallback, useMemo, useReducer } from 'react';
import { useQuery } from 'react-query';
import {
    generateProofCallData, MerkleTree, pedersenHashConcat, toHex
} from 'zkp-merkle-airdrop-lib';

import commitments from '../pages/api/distributions/[address]/commitments';
import { generateRoot, generateTree } from '../utils/merkle-tree';

interface ProofState {
  error?: Error;
  isGenerating: boolean;
  proof?: string;
}

type ProofAction =
  | { type: "startGenerating" }
  | { type: "setProof"; payload: string }
  | { type: "setError"; payload: Error };

function reducer(state: ProofState, action: ProofAction): ProofState {
  switch (action.type) {
    case "startGenerating":
      return {
        error: undefined,
        isGenerating: true,
        proof: undefined,
      };
    case "setProof":
      return {
        error: undefined,
        isGenerating: false,
        proof: action.payload,
      };
    case "setError":
      return {
        error: action.payload,
        isGenerating: false,
        proof: undefined,
      };
    default:
      console.warn("Unsupported ProofState reducer action:", action);
      return state;
  }
}

export interface UseZKProofProps {
  distributionAddress: string;
  key?: string;
  secret?: string;
  account?: string;
}

export interface MerkleTreeInfo {
  merkleTree: MerkleTree;
}

interface UseZKProof extends ProofState, Partial<MerkleTreeInfo> {
  generate: () => Promise<string> | undefined;
  isEligible: boolean;
  isReady: boolean;
}

export default function useZKProof({
  distributionAddress,
  key,
  secret,
  account,
}: UseZKProofProps): UseZKProof {
  const [state, dispatch] = useReducer(reducer, {
    isGenerating: false,
  });

  const { data: commitmentsTree, isSuccess } = useQuery({
    queryKey: "zk-commitments",
    queryFn: async () => {
      if (distributionAddress) {
        const res = await fetch(
          `/api/distributions/${distributionAddress}/commitments`
        );
        const commitments = await res.json();
        console.log("Commitments: ", commitments);
        return generateTree(commitments.commitments);
      }
    },
  });

  const treesReady = !!commitmentsTree;
  const treesSuccess = isSuccess;

  const { data: wasmBuffer, isSuccess: wasmBufferSuccess } = useQuery({
    queryKey: "zk-wasm-buffer",
    queryFn: () =>
      fetch(`/circuit.wasm`)
        .then((res) => res.arrayBuffer())
        .then((ab) => Buffer.from(ab)),
    staleTime: Infinity,
    // make sure to download trees first
    enabled: treesSuccess,
  });
  const { data: zkeyBuffer, isSuccess: zkeyBufferSuccess } = useQuery({
    queryKey: "zk-zkey-buffer",
    queryFn: () =>
      fetch(`/circuit_final.zkey`)
        .then((res) => res.arrayBuffer())
        .then((ab) => Buffer.from(ab)),
    staleTime: Infinity,
    // make sure to download trees first
    enabled: treesSuccess,
  });

  // set isEligible when the key, secret, and/or merkleTree change
  const merkleTreeInfo = useMemo<MerkleTreeInfo | undefined>(() => {
    if (key && secret && treesReady) {
      let commitment: string;

      // OK to catch, as it throws in the case of being not eligible
      try {
        commitment = toHex(pedersenHashConcat(BigInt(key), BigInt(secret)));
      } catch (e) {
        return undefined;
      }

      const merkleTrees = [
        {
          merkleTree: commitmentsTree,
        },
      ];
      for (const treeInfo of merkleTrees) {
        const leafExists = treeInfo.merkleTree.leafExists(BigInt(commitment));
        console.log("commitment: ", commitment);
        console.log("leafExists: ", leafExists);
        if (leafExists) {
          return treeInfo;
        }
      }
    }
  }, [key, secret, treesReady, commitmentsTree]);

  const isReady = !!(
    treesSuccess &&
    wasmBufferSuccess &&
    zkeyBufferSuccess &&
    wasmBuffer &&
    zkeyBuffer
  );

  const generate = useCallback(() => {
    console.log("isReady: ", isReady);
    console.log("merkleTreeInfo: ", merkleTreeInfo);
    console.log("key: ", key);
    console.log("secret: ", secret);
    console.log("account: ", account);
    if (isReady && merkleTreeInfo && key && secret && account) {
      // the last 2 characters represent the MSB which are removed by the
      // pedersenHash function when creating the commitment (public ID). To
      // generate a valid proof, they need to be removed here too.
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const cleanedKey = key.replace(/^0x0{1,2}/, "0x").slice(0, 64);
      // the last 2 characters represent the MSB which are removed by the
      // pedersenHash function when creating the commitment (public ID). To
      // generate a valid proof, they need to be removed here too.
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      const cleanedSecret = secret.replace(/^0x0{1,2}/, "0x").slice(0, 64);
      dispatch({ type: "startGenerating" });

      return generateProofCallData(
        merkleTreeInfo?.merkleTree,
        BigInt(cleanedKey),
        BigInt(cleanedSecret),
        account,
        wasmBuffer,
        zkeyBuffer
      )
        .then((proof) => {
          dispatch({ type: "setProof", payload: proof });
          return proof;
        })
        .catch((err) => {
          dispatch({ type: "setError", payload: err });
          return err?.message || "";
        });
    }
  }, [
    distributionAddress,
    key,
    secret,
    account,
    merkleTreeInfo,
    wasmBuffer,
    zkeyBuffer,
    isReady,
  ]);

  return {
    generate,
    isReady,
    isEligible: !!merkleTreeInfo,
    ...state,
    ...merkleTreeInfo,
  };
}
