// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {ERC1155PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155PausableUpgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @custom:security-contact sigmasauer07.hub
contract SigmaSauer07 is
    Initializable,
    ERC1155Upgradeable,
    OwnableUpgradeable,
    ERC1155PausableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155SupplyUpgradeable,
    UUPSUpgradeable,
    IERC2981
{
    /// -------- Events -------- ///
    event Minted(address indexed account, uint256 indexed id, uint256 amount);
    event BatchMinted(address indexed account, uint256[] ids, uint256[] amounts);
    event RoyaltiesSet(uint256 indexed tokenId, address indexed receiver, uint96 feeNumerator);

    /// -------- Storage -------- ///
    struct RoyaltyInfo {
        address receiver;
        uint96 royaltyFraction; // e.g. 500 = 5.00%
    }

    mapping(uint256 => RoyaltyInfo) private _royalties;
    uint96 public constant FEE_DENOMINATOR = 10000;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC1155_init("https://bafybeiefybu53dszvhprblhzw5h54xzpwmdn2ckuxf6vnpv2nu5mihdjam.ipfs.dweb.link?filename=sigmasauer07-metadata.json");
        __Ownable_init(initialOwner);
        __ERC1155Pausable_init();
        __ERC1155Burnable_init();
        __ERC1155Supply_init();
        __UUPSUpgradeable_init();
    }

    /// -------- Minting -------- ///
    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
        emit Minted(account, id, amount);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
        emit BatchMinted(to, ids, amounts);
    }

    /// -------- URI + Pause -------- ///
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// -------- Royalties (ERC2981) -------- ///
    function setRoyalties(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
        require(feeNumerator <= FEE_DENOMINATOR, "Fee too high");
        _royalties[tokenId] = RoyaltyInfo(receiver, feeNumerator);
        emit RoyaltiesSet(tokenId, receiver, feeNumerator);
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        RoyaltyInfo memory royalty = _royalties[tokenId];
        receiver = royalty.receiver;
        royaltyAmount = (salePrice * royalty.royaltyFraction) / FEE_DENOMINATOR;
    }

    /// -------- UUPS -------- ///
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    /// -------- Overrides -------- ///
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155Upgradeable, ERC1155PausableUpgradeable, ERC1155SupplyUpgradeable)
    {
        super._update(from, to, ids, values);
    }
}
