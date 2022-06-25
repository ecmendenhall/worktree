// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/test/mocks/MockERC20.sol";

contract LocalHelpers is Script {

    function run() external {
        vm.startBroadcast();

        new MockERC20("Fake DAI", "DAI");
        (bool success,) = payable(address(0xe979054eB69F543298406447D8AB6CBBc5791307)).call{value: 1 ether}("");
    }
}
