// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IPlonkVerifier {
    function verifyProof(bytes memory proof, uint256[] memory pubSignals)
        external
        view
        returns (bool);
}
