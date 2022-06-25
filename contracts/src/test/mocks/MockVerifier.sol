// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../../interfaces/IPlonkVerifier.sol";

contract MockVerifier is IPlonkVerifier {
    bool isValid;

    function verifyProof(bytes memory proof, uint256[] memory pubSignals)
        external
        view
        returns (bool)
    {
        return isValid;
    }

    function setIsValid(bool value) external {
        isValid = value;
    }
}
