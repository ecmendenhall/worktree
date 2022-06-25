// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import "./mocks/MockERC20.sol";
import "../WorktreeFactory.sol";
import "../compiled/PlonkVerifier.sol";

contract WorktreeFactoryTest is Test {
    PlonkVerifier internal verifier;
    WorktreeFactory internal factory;
    MockERC20 internal token;

    bytes32 internal constant salt = keccak256("salt");
    bytes32 internal constant root = keccak256("root");
    uint256 internal constant claimAmount = 100 ether;
    address internal constant nonOwner = address(0x42);

    function setUp() public {
        token = new MockERC20("Mock Token", "MOCK");
        verifier = new PlonkVerifier();
        factory = new WorktreeFactory(address(verifier));
    }

    function testHasVerifier() public {
        assertEq(address(factory.verifier()), address(verifier));
    }

    function testCreateERC20TreeReturnsTreeAddress() public {
        (
            address tree, /* address claimModule */

        ) = factory.createERC20(salt, root, token, claimAmount);
        assertEq(tree, address(0x51592BFb5eC2B63d3B9386CD7061cdBEC13Fa30B));
    }

    function testCreateERC20TreeGeneratedTreeAddressMatchesPredictedAddress()
        public
    {
        (address treePredicted, ) = factory.getCreateERC20Addresses(
            salt,
            root,
            token,
            claimAmount
        );
        (
            address tree, /* address claimModule */

        ) = factory.createERC20(salt, root, token, claimAmount);
        assertEq(tree, treePredicted);
    }

    function testCreateERC20TreeReturnsClaimModuleAddress() public {
        (
            ,
            /* address tree */
            address claimModule
        ) = factory.createERC20(salt, root, token, claimAmount);
        assertEq(
            claimModule,
            address(0x0ba866D20e73305ba6800D247B1894d9cbe42027)
        );
    }

    function testCreateERC20TreeGeneratedClaimModuleAddressMatchesPredictedClaimModuleAddress()
        public
    {
        (, address claimModulePredicted) = factory.getCreateERC20Addresses(
            salt,
            root,
            token,
            claimAmount
        );
        (, address claimModule) = factory.createERC20(
            salt,
            root,
            token,
            claimAmount
        );
        assertEq(claimModule, claimModulePredicted);
    }

    function testCreateERC20TreeReturnedTreeHasVerifier() public {
        (
            address treeAddress, /* address claimModule */

        ) = factory.createERC20(salt, root, token, claimAmount);
        IWorktree tree = IWorktree(treeAddress);
        assertEq(address(tree.verifier()), address(verifier));
    }

    function testCreateERC20TreeReturnedTreeOwnerIsCaller() public {
        (
            address treeAddress, /* address claimModule */

        ) = factory.createERC20(salt, root, token, claimAmount);
        IWorktree tree = IWorktree(treeAddress);

        bytes32 newRoot = keccak256("new root");
        tree.updateRoot(newRoot);
        assertEq(tree.root(), newRoot);

        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        tree.updateRoot(newRoot);
    }
}
