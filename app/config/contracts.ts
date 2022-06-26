import { chain } from 'wagmi';

const contracts = {
  factory: {
    address: {
      [chain.polygonMumbai.id]: "0xe203d2b0b42ceb8827760963da2d7c051411e47b",
      [chain.hardhat.id]: "0x0165878a594ca255338adfa4d48449f69242eb8f",
    },
    abi: [
      "event NewTree(bytes32 salt, address tree, address claimModule)",
      "function getCreateERC20Addresses(bytes32 salt, bytes32 root, address token, uint256 claimAmount) external view returns (address, address)",
      "function createERC20(bytes32 salt, bytes32 root, address token, uint256 claimAmount) external",
    ],
  },
  tree: {
    abi: [
      "function claim(bytes memory proof, bytes32 nullifierhash) external",
      "function updateRoot(bytes32 newRoot) external",
    ],
  },
};

export default contracts;
