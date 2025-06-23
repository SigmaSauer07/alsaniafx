// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract RoyaltyMockNFT is ERC721, IERC2981 {
    constructor() ERC721("RoyaltyMock", "RMK") {}

    function mint(uint256 tokenId) external {
        _mint(msg.sender, tokenId);
    }

    function royaltyInfo(uint256, uint256 salePrice) external pure override returns (address, uint256) {
        return (address(0xDEADBEEF), salePrice / 20); // 5% royalty
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165, ERC721) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}