// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IClaimModule.sol";

contract ERC20Claim is IClaimModule {
    using SafeERC20 for IERC20;

    event Claim(address recipient, uint256 amount);

    IERC20 public token;
    uint256 public claimAmount;
    address public tree;

    constructor(IERC20 token_, uint256 claimAmount_) {
        token = token_;
        claimAmount = claimAmount_;
        tree = msg.sender;
    }

    modifier onlyTree() {
        if (msg.sender != tree) {
            revert Unauthorized();
        }
        _;
    }

    function claim(address recipient) public onlyTree {
        emit Claim(recipient, claimAmount);
        token.safeTransfer(recipient, claimAmount);
    }
}
