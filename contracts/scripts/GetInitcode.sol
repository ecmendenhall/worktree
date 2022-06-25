// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Worktree.sol";
import "../src/modules/ERC20Claim.sol";

contract GetInitcode is Script {

    function run() external {
        console.logBytes(abi.encodePacked(type(Worktree).creationCode));
        console.logBytes(abi.encodePacked(type(ERC20Claim).creationCode));
        console.logBytes(abi.encodePacked(
            keccak256(
                abi.encodePacked(
                    bytes1(0xff),
                    address(0x7eec69f5B38a6e814fc28ECbd9300666eb1164aB),
                    abi.encodePacked(bytes32(0xfb2a60357320c88621d7189c752ee71d135c60c083aa958e7b286c68903c033e)), keccak256(type(Worktree).creationCode)))));
    }
}
