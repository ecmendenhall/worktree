const contracts = {
  factory: {
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
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
