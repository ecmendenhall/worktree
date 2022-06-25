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

        ) = factory.createERC20(root, token, claimAmount);
        assertEq(tree, address(0xD457ECDAD18BA6917097BcA0c5A1D6A97da8C26a));
    }

    function testCreateERC20TreeReturnsClaimModuleAddress() public {
        (
            ,
            /* address tree */
            address claimModule
        ) = factory.createERC20(root, token, claimAmount);
        assertEq(
            claimModule,
            address(0xdd36aa107BcA36Ba4606767D873B13B4770F3b12)
        );
    }

    function testCreateERC20TreeReturnedTreeHasVerifier() public {
        (
            address treeAddress, /* address claimModule */

        ) = factory.createERC20(root, token, claimAmount);
        IWorktree tree = IWorktree(treeAddress);
        assertEq(address(tree.verifier()), address(verifier));
    }

    function testCreateERC20TreeReturnedTreeOwnerIsCaller() public {
        (
            address treeAddress, /* address claimModule */

        ) = factory.createERC20(root, token, claimAmount);
        IWorktree tree = IWorktree(treeAddress);

        bytes32 newRoot = keccak256("new root");
        tree.updateRoot(newRoot);
        assertEq(tree.root(), newRoot);

        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        tree.updateRoot(newRoot);
    }
}
