// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract NFTFactoryUpgradeable is
    Initializable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    IERC2981
{
    struct Collection {
        uint256 id;
        string name;
        string symbol;
        string contractURI;
        string baseURI;
        bool isERC721;
        address creator;
        address royaltyRecipient;
        uint16 royaltyBps;
    }

    struct NFT {
        uint256 collectionId;
        uint256 tokenId;
        string metadataURI;
        uint256 supply;
    }

    uint256 private _collectionCounter;
    mapping(uint256 => uint256) private _tokenCounters;
    mapping(uint256 => Collection) public collections;
    mapping(uint256 => NFT) public nfts;
    mapping(uint256 => uint256[]) public collectionNFTs;

    mapping(uint256 => mapping(address => uint256)) private _balances1155;
    mapping(address => mapping(address => bool)) private _operatorApprovals1155;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721URIStorage_init();
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init(); // ✅ OpenZeppelin v5+ added this again
        __ERC721_init("NFTFactory", "NFTF");
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    // ====== COLLECTION CREATION ======
    function createCollection(
        string memory name,
        string memory symbol,
        string memory _contractURI,
        string memory _baseURI,
        bool isERC721,
        address royaltyRecipient,
        uint16 royaltyBps
    ) public returns (uint256) {
        require(royaltyBps <= 1000, "Max 10% royalty");

        uint256 newId = _collectionCounter++;
        collections[newId] = Collection({
            id: newId,
            name: name,
            symbol: symbol,
            contractURI: _contractURI,
            baseURI: _baseURI,
            isERC721: isERC721,
            creator: msg.sender,
            royaltyRecipient: royaltyRecipient,
            royaltyBps: royaltyBps
        });

        return newId;
    }

    // ====== MINTING ======
    function mintNFT(
        uint256 collectionId,
        string memory metadata,
        uint256 amount,
        address recipient
    ) public {
        Collection memory collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not collection owner");

        uint256 newTokenId = (collectionId << 128) | _tokenCounters[collectionId]++;
        nfts[newTokenId] = NFT({
            collectionId: collectionId,
            tokenId: newTokenId,
            metadataURI: metadata,
            supply: amount
        });

        collectionNFTs[collectionId].push(newTokenId);

        if (collection.isERC721) {
            require(amount == 1, "ERC721 requires 1");
            _safeMint(recipient, newTokenId);
            _setTokenURI(newTokenId, metadata);
        } else {
            _mint1155(recipient, newTokenId, amount);
        }
    }

    function _mint1155(address to, uint256 id, uint256 amount) internal {
        require(to != address(0), "ERC1155: zero address");
        _balances1155[id][to] += amount;
        emit ERC1155TransferSingle(msg.sender, address(0), to, id, amount);
    }

    // ====== ERC1155 CUSTOM EVENTS ======
    event ERC1155TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event ERC1155ApprovalForAll(address indexed account, address indexed operator, bool approved);

    // ====== UTILS ======
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        NFT memory nft = nfts[tokenId];
        Collection memory collection = collections[nft.collectionId];
        return string(abi.encodePacked(collection.baseURI, nft.metadataURI));
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address, uint256)
    {
        Collection memory c = collections[nfts[tokenId].collectionId];
        uint256 royaltyAmount = (salePrice * c.royaltyBps) / 10000;
        return (c.royaltyRecipient, royaltyAmount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorageUpgradeable, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function balanceOf1155(address account, uint256 id) public view returns (uint256) {
        return _balances1155[id][account];
    }

    function setApprovalForAll1155(address operator, bool approved) public {
        _operatorApprovals1155[msg.sender][operator] = approved;
        emit ERC1155ApprovalForAll(msg.sender, operator, approved);
    }
}
