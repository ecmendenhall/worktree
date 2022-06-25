// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "./Worktree.sol";
import "./modules/ERC20Claim.sol";
import "./interfaces/IClaimModule.sol";
import "./interfaces/IPlonkVerifier.sol";

contract WorktreeFactory {
    event NewTree(bytes32 salt, address tree, address claimModule);

    IPlonkVerifier public immutable verifier;

    constructor(address _verifier) {
        verifier = IPlonkVerifier(_verifier);
    }

    function createERC20(
        bytes32 salt,
        bytes32 root,
        IERC20 token,
        uint256 claimAmount
    ) external returns (address, address) {
        IClaimModule claimModule = new ERC20Claim{salt: salt}(
            token,
            claimAmount
        );
        Worktree worktree = new Worktree{salt: salt}(
            verifier,
            claimModule,
            root
        );
        worktree.transferOwnership(msg.sender);
        address treeAddress = address(worktree);
        address claimAddress = address(claimModule);
        emit NewTree(salt, treeAddress, claimAddress);
        return (treeAddress, claimAddress);
    }

    function getCreateERC20Addresses(
        bytes32 salt,
        bytes32 root,
        IERC20 token,
        uint256 claimAmount
    ) external view returns (address, address) {
        address claimModule = _create2Address(
            salt,
            abi.encodePacked(
                type(ERC20Claim).creationCode,
                abi.encode(token),
                abi.encode(claimAmount)
            )
        );
        address tree = _create2Address(
            salt,
            abi.encodePacked(
                type(Worktree).creationCode,
                abi.encode(verifier),
                abi.encode(claimModule),
                abi.encode(root)
            )
        );
        return (tree, claimModule);
    }

    function _create2Address(bytes32 salt, bytes memory initCode)
        internal
        view
        returns (address)
    {
        return
            address(
                uint160(
                    uint256(
                        keccak256(
                            abi.encodePacked(
                                bytes1(0xff),
                                address(this),
                                salt,
                                keccak256(initCode)
                            )
                        )
                    )
                )
            );
    }
}
