// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../../interfaces/IClaimModule.sol";

contract MockClaimModule is IClaimModule {
    address public caller;
    bool public called;

    function claim(address recipient) external {
        called = true;
        caller = recipient;
    }
}
