// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract NFTFactoryUpgradeable is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
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
        uint256 maxSupply;
        uint256 totalMinted;
        bool isPublic;
        uint256 mintPrice;
        bool isPaused;
        bool isVerified;
        uint256 createdAt;
        uint256 totalVolume;
    }

    struct NFT {
        uint256 collectionId;
        string metadata;
        address creator;
        uint256 createdAt;
        string attributes;
    }

    struct MetadataChange {
        uint256 tokenId;
        string newMetadata;
        uint256 updatedAt;
        address updatedBy;
    }

    mapping(uint256 => Collection) public collections;
    mapping(uint256 => NFT) public nfts;
    mapping(uint256 => mapping(address => bool)) public hasMinted;
    mapping(uint256 => uint256) public collectionMintPrices;
    mapping(uint256 => MetadataChange[]) public metadataUpdates;
    mapping(address => bool) public verifiedCreators;
    mapping(uint256 => bool) public verifiedCollections;

    uint256 public collectionCounter;
    uint256 public nftCounter;

    event CollectionCreated(uint256 indexed id, string name, address indexed creator);
    event NFTMinted(uint256 indexed collectionId, uint256 indexed tokenId, address indexed recipient);
    event CollectionUpdated(uint256 indexed id, string name);
    event MintPriceSet(uint256 indexed collectionId, uint256 price);
    event PublicMintToggled(uint256 indexed collectionId, bool isPublic);
    event MetadataUpdated(uint256 indexed tokenId, string newMetadata, address indexed updatedBy);
    event CreatorVerified(address indexed creator, bool verified);
    event CollectionVerified(uint256 indexed collectionId, bool verified);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("AlsaniaFX NFT Factory", "ANF");
        __ERC721URIStorage_init();
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
    }

    function createCollection(
        string memory name,
        string memory symbol,
        string memory contractURI,
        string memory baseURI,
        bool isERC721,
        address creator,
        uint16 royaltyBps,
        uint256 maxSupply,
        uint256 mintPrice
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(royaltyBps <= 1000, "Royalty cannot exceed 10%");
        require(maxSupply > 0, "Max supply must be greater than 0");

        uint256 collectionId = collectionCounter++;
        
        collections[collectionId] = Collection({
            id: collectionId,
            name: name,
            symbol: symbol,
            contractURI: contractURI,
            baseURI: baseURI,
            isERC721: isERC721,
            creator: creator,
            royaltyRecipient: creator,
            royaltyBps: royaltyBps,
            maxSupply: maxSupply,
            totalMinted: 0,
            isPublic: false,
            mintPrice: mintPrice,
            isPaused: false,
            isVerified: false,
            createdAt: block.timestamp,
            totalVolume: 0
        });

        emit CollectionCreated(collectionId, name, creator);
        return collectionId;
    }

    function mintNFT(
        uint256 collectionId,
        string memory metadata,
        uint256 amount,
        address recipient,
        string memory attributes
    ) public payable whenNotPaused nonReentrant {
        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender || collection.isPublic, "Not authorized");
        require(!collection.isPaused, "Collection paused");
        require(collection.totalMinted + amount <= collection.maxSupply, "Exceeds max supply");

        if (collection.isPublic && collection.mintPrice > 0) {
            require(msg.value >= collection.mintPrice * amount, "Insufficient payment");
        }

        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = nftCounter++;
            
            _safeMint(recipient, tokenId);
            _setTokenURI(tokenId, metadata);

            nfts[tokenId] = NFT({
                collectionId: collectionId,
                metadata: metadata,
                creator: msg.sender,
                createdAt: block.timestamp,
                attributes: attributes
            });

            collection.totalMinted++;
            emit NFTMinted(collectionId, tokenId, recipient);
        }
    }

    function batchMintNFT(
        uint256 collectionId,
        string[] memory metadataArray,
        address[] memory recipients,
        string[] memory attributesArray
    ) public whenNotPaused nonReentrant {
        require(metadataArray.length == recipients.length, "Arrays length mismatch");
        require(metadataArray.length == attributesArray.length, "Arrays length mismatch");

        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not authorized");
        require(!collection.isPaused, "Collection paused");
        require(collection.totalMinted + metadataArray.length <= collection.maxSupply, "Exceeds max supply");

        for (uint256 i = 0; i < metadataArray.length; i++) {
            uint256 tokenId = nftCounter++;
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, metadataArray[i]);

            nfts[tokenId] = NFT({
                collectionId: collectionId,
                metadata: metadataArray[i],
                creator: msg.sender,
                createdAt: block.timestamp,
                attributes: attributesArray[i]
            });

            collection.totalMinted++;
            emit NFTMinted(collectionId, tokenId, recipients[i]);
        }
    }

    function updateMetadata(uint256 tokenId, string memory newMetadata) public {
        NFT storage nft = nfts[tokenId];
        require(nft.creator == msg.sender, "Not authorized");
        
        nft.metadata = newMetadata;
        _setTokenURI(tokenId, newMetadata);

        metadataUpdates[tokenId].push(MetadataChange({
            tokenId: tokenId,
            newMetadata: newMetadata,
            updatedAt: block.timestamp,
            updatedBy: msg.sender
        }));

        emit MetadataUpdated(tokenId, newMetadata, msg.sender);
    }

    function updateCollection(
        uint256 collectionId,
        string memory name,
        string memory symbol,
        string memory contractURI,
        string memory baseURI
    ) public {
        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not authorized");
        
        collection.name = name;
        collection.symbol = symbol;
        collection.contractURI = contractURI;
        collection.baseURI = baseURI;
        
        emit CollectionUpdated(collectionId, name);
    }

    function setMintPrice(uint256 collectionId, uint256 price) public {
        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not authorized");
        
        collection.mintPrice = price;
        emit MintPriceSet(collectionId, price);
    }

    function togglePublicMint(uint256 collectionId) public {
        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not authorized");
        
        collection.isPublic = !collection.isPublic;
        emit PublicMintToggled(collectionId, collection.isPublic);
    }

    function pauseCollection(uint256 collectionId) public {
        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not authorized");
        
        collection.isPaused = true;
    }

    function unpauseCollection(uint256 collectionId) public {
        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not authorized");
        
        collection.isPaused = false;
    }

    // Admin functions for verification
    function verifyCreator(address creator, bool verified) public onlyOwner {
        verifiedCreators[creator] = verified;
        emit CreatorVerified(creator, verified);
    }

    function verifyCollection(uint256 collectionId, bool verified) public onlyOwner {
        verifiedCollections[collectionId] = verified;
        collections[collectionId].isVerified = verified;
        emit CollectionVerified(collectionId, verified);
    }

    function getCollection(uint256 collectionId) public view returns (Collection memory) {
        return collections[collectionId];
    }

    function getNFT(uint256 tokenId) public view returns (NFT memory) {
        return nfts[tokenId];
    }

    function getMetadataUpdates(uint256 tokenId) public view returns (MetadataChange[] memory) {
        return metadataUpdates[tokenId];
    }

    function getCollectionNFTs(uint256 collectionId) public view returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](collections[collectionId].totalMinted);
        uint256 count = 0;
        
        for (uint256 i = 0; i < nftCounter; i++) {
            if (nfts[i].collectionId == collectionId) {
                tokenIds[count] = i;
                count++;
            }
        }
        
        return tokenIds;
    }

    function getCollectionsByCreator(address creator) public view returns (uint256[] memory) {
        uint256[] memory collectionIds = new uint256[](collectionCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < collectionCounter; i++) {
            if (collections[i].creator == creator) {
                collectionIds[count] = i;
                count++;
            }
        }
        
        return collectionIds;
    }

    function getPublicCollections() public view returns (uint256[] memory) {
        uint256[] memory collectionIds = new uint256[](collectionCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < collectionCounter; i++) {
            if (collections[i].isPublic) {
                collectionIds[count] = i;
                count++;
            }
        }
        
        return collectionIds;
    }

    function getVerifiedCollections() public view returns (uint256[] memory) {
        uint256[] memory collectionIds = new uint256[](collectionCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < collectionCounter; i++) {
            if (collections[i].isVerified) {
                collectionIds[count] = i;
                count++;
            }
        }
        
        return collectionIds;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}

