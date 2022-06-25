// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import "../modules/ERC20Claim.sol";
import "./mocks/MockERC20.sol";
import "./mocks/MockClaimModule.sol";

contract ERC20ClaimTest is Test {
    MockERC20 internal token;
    ERC20Claim internal claimModule;
    address internal constant notTree = address(0x42);
    address internal constant recipient = address(0x69);

    function setUp() public {
        token = new MockERC20("Mock Token", "MOCK");
        claimModule = new ERC20Claim(token, 100 ether);
    }

    function testHasToken() public {
        assertEq(address(claimModule.token()), address(token));
    }

    function testHasTreeAddress() public {
        assertEq(address(claimModule.tree()), address(this));
    }

    function testRevertsOnInvalidCaller() public {
        vm.prank(notTree);
        vm.expectRevert(Unauthorized.selector);
        claimModule.claim(recipient);
    }

    function testRevertsOnInsufficientBalance() public {
        vm.expectRevert("ERC20: transfer amount exceeds balance");
        claimModule.claim(recipient);
    }

    function testTransfersTokensToCaller() public {
        token.mint(address(claimModule), 100 ether);
        assertEq(token.balanceOf(recipient), 0);

        claimModule.claim(recipient);

        assertEq(token.balanceOf(recipient), 100 ether);
    }
}
