// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/compiled/PlonkVerifier.sol";
import "../src/WorktreeFactory.sol";

contract Deploy is Script {

    function run() external {
        vm.startBroadcast();

        PlonkVerifier verifier = new PlonkVerifier();
        new WorktreeFactory(address(verifier));
    }
}
