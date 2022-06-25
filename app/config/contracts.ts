const contracts = {
  factory: {
    address: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
    abi: [
      "event NewTree(bytes32 salt, address tree, address claimModule)",
      "function getCreateERC20Addresses(bytes32 salt, bytes32 root, address token, uint256 claimAmount) external view returns (address, address)",
      "function createERC20(bytes32 salt, bytes32 root, address token, uint256 claimAmount) external",
    ],
  },
};

export default contracts;
