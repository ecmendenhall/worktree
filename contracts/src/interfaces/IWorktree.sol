// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./IPlonkVerifier.sol";

error InvalidNullifierHash();
error AlreadyClaimed();
error InvalidProof();

interface IWorktree {
    function verifier() external returns (IPlonkVerifier);

    function root() external returns (bytes32);

    function claim(bytes memory proof, bytes32 nullifierHash) external;

    function updateRoot(bytes32 newRoot) external;
}
