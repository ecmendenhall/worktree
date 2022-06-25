// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./Worktree.sol";
import "./modules/ERC20Claim.sol";
import "./interfaces/IClaimModule.sol";
import "./interfaces/IPlonkVerifier.sol";

contract WorktreeFactory {
    IPlonkVerifier public immutable verifier;

    constructor(address _verifier) {
        verifier = IPlonkVerifier(_verifier);
    }

    function createERC20(
        bytes32 root,
        IERC20 token,
        uint256 claimAmount
    ) external returns (address, address) {
        IClaimModule claimModule = new ERC20Claim(token, claimAmount);
        Worktree worktree = new Worktree(verifier, claimModule, root);
        worktree.transferOwnership(msg.sender);
        return (address(worktree), address(claimModule));
    }
}
