// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

import "./interfaces/IWorktree.sol";
import "./interfaces/IPlonkVerifier.sol";
import "./interfaces/IClaimModule.sol";

contract Worktree is IWorktree, Ownable {
    IPlonkVerifier public immutable verifier;
    IClaimModule public immutable claimModule;

    bytes32 public root;
    mapping(bytes32 => bool) public spent;

    uint256 public constant SNARK_FIELD =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    constructor(
        IPlonkVerifier _verifier,
        IClaimModule _claimModule,
        bytes32 _root
    ) {
        verifier = _verifier;
        root = _root;
        claimModule = _claimModule;
    }

    function claim(bytes calldata proof, bytes32 nullifierHash) public {
        if (uint256(nullifierHash) >= SNARK_FIELD) {
            revert InvalidNullifierHash();
        }
        if (spent[nullifierHash]) {
            revert AlreadyClaimed();
        }

        uint256[] memory pubSignals = new uint256[](3);
        pubSignals[0] = uint256(root);
        pubSignals[1] = uint256(nullifierHash);
        pubSignals[2] = uint256(uint160(msg.sender));

        if (!verifier.verifyProof(proof, pubSignals)) {
            revert InvalidProof();
        }
        spent[nullifierHash] = true;
        claimModule.claim(msg.sender);
    }

    function updateRoot(bytes32 newRoot) public onlyOwner {
        root = newRoot;
    }
}
