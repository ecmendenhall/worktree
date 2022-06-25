// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import "../Worktree.sol";
import "./mocks/MockVerifier.sol";
import "./mocks/MockClaimModule.sol";

contract WorktreeTest is Test {
    Worktree internal worktree;
    MockVerifier internal verifier;
    MockClaimModule internal claimModule;

    address nonOwner = address(0x42);
    bytes32 constant root = keccak256("root");

    function setUp() public {
        verifier = new MockVerifier();
        claimModule = new MockClaimModule();
        worktree = new Worktree(verifier, claimModule, root);
    }

    function testHasVerifier() public {
        assertEq(address(worktree.verifier()), address(verifier));
    }

    function testHasClaimModule() public {
        assertEq(address(worktree.claimModule()), address(claimModule));
    }

    function testHasRoot() public {
        assertEq(worktree.root(), root);
    }

    function testHasOwner() public {
        assertEq(worktree.owner(), address(this));
    }

    function testOwnerCanUpdateRoot() public {
        bytes32 newRoot = keccak256("new root");
        worktree.updateRoot(newRoot);
        assertEq(worktree.root(), newRoot);
    }

    function testNonOwnerCannotUpdateRoot() public {
        bytes32 newRoot = keccak256("new root");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        worktree.updateRoot(newRoot);
    }

    function testInvalidNullifierHashReverts() public {
        bytes32 invalidHash = bytes32(worktree.SNARK_FIELD());
        vm.expectRevert(InvalidNullifierHash.selector);
        worktree.claim("", invalidHash);
    }

    function testSpentNullifierHashReverts() public {
        verifier.setIsValid(true);
        bytes32 validHash = bytes32(uint256(1));
        worktree.claim("", validHash);

        vm.expectRevert(AlreadyClaimed.selector);
        worktree.claim("", validHash);
    }

    function testInvalidProofReverts() public {
        bytes32 validHash = bytes32(uint256(1));
        vm.expectRevert(InvalidProof.selector);
        worktree.claim("", validHash);
    }

    function testStoresSpentHash() public {
        verifier.setIsValid(true);
        bytes32 validHash = bytes32(uint256(1));
        worktree.claim("", validHash);

        assertTrue(worktree.spent(validHash));
    }

    function testCallsClaim() public {
        verifier.setIsValid(true);
        bytes32 validHash = bytes32(uint256(1));
        worktree.claim("", validHash);

        assertTrue(claimModule.called());
        assertEq(claimModule.caller(), address(this));
    }
}
