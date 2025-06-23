// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
    uint256 public supply;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(uint256 tokenId) external {
        _mint(msg.sender, tokenId);
        supply++;
    }
}
