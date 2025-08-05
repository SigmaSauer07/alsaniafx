// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract LazyMinting is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    using ECDSA for bytes32;

    struct LazyNFT {
        address creator;
        string metadata;
        uint256 price;
        uint256 royaltyBps;
        address royaltyRecipient;
        bool isMinted;
        uint256 createdAt;
    }

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    mapping(uint256 => LazyNFT) public lazyNFTs;
    mapping(bytes32 => bool) public usedSignatures;
    mapping(address => bool) public authorizedSigners;

    uint256 public lazyNFTCounter;
    uint256 public mintedCounter;

    event LazyNFTCreated(uint256 indexed id, address indexed creator, string metadata, uint256 price);
    event LazyNFTMinted(uint256 indexed id, address indexed recipient, uint256 tokenId);
    event SignerAuthorized(address indexed signer, bool authorized);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("AlsaniaFX Lazy Minting", "ALM");
        __ERC721URIStorage_init();
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        // Authorize the deployer as a signer
        authorizedSigners[msg.sender] = true;
    }

    function createLazyNFT(
        string memory metadata,
        uint256 price,
        uint16 royaltyBps,
        address royaltyRecipient
    ) public returns (uint256) {
        require(bytes(metadata).length > 0, "Metadata cannot be empty");
        require(royaltyBps <= 1000, "Royalty cannot exceed 10%");

        uint256 lazyNFTId = lazyNFTCounter++;
        
        lazyNFTs[lazyNFTId] = LazyNFT({
            creator: msg.sender,
            metadata: metadata,
            price: price,
            royaltyBps: royaltyBps,
            royaltyRecipient: royaltyRecipient,
            isMinted: false,
            createdAt: block.timestamp
        });

        emit LazyNFTCreated(lazyNFTId, msg.sender, metadata, price);
        return lazyNFTId;
    }

    function mintLazyNFT(
        uint256 lazyNFTId,
        address recipient,
        Signature memory signature
    ) public payable whenNotPaused nonReentrant {
        LazyNFT storage lazyNFT = lazyNFTs[lazyNFTId];
        require(!lazyNFT.isMinted, "NFT already minted");
        require(lazyNFT.creator != address(0), "Lazy NFT does not exist");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            lazyNFTId,
            recipient,
            lazyNFT.price,
            lazyNFT.metadata
        ));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        
        require(!usedSignatures[ethSignedMessageHash], "Signature already used");
        require(authorizedSigners[ethSignedMessageHash.recover(signature.v, signature.r, signature.s)], "Invalid signature");

        // Check payment
        if (lazyNFT.price > 0) {
            require(msg.value >= lazyNFT.price, "Insufficient payment");
            
            // Transfer payment to creator
            (bool success, ) = lazyNFT.creator.call{value: msg.value}("");
            require(success, "Payment transfer failed");
        }

        // Mint the NFT
        uint256 tokenId = mintedCounter++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, lazyNFT.metadata);

        lazyNFT.isMinted = true;
        usedSignatures[ethSignedMessageHash] = true;

        emit LazyNFTMinted(lazyNFTId, recipient, tokenId);
    }

    function batchMintLazyNFTs(
        uint256[] memory lazyNFTIds,
        address[] memory recipients,
        Signature[] memory signatures
    ) public payable whenNotPaused nonReentrant {
        require(lazyNFTIds.length == recipients.length, "Arrays length mismatch");
        require(lazyNFTIds.length == signatures.length, "Arrays length mismatch");

        uint256 totalPrice = 0;
        
        // Calculate total price
        for (uint256 i = 0; i < lazyNFTIds.length; i++) {
            LazyNFT storage lazyNFT = lazyNFTs[lazyNFTIds[i]];
            require(!lazyNFT.isMinted, "NFT already minted");
            totalPrice += lazyNFT.price;
        }

        require(msg.value >= totalPrice, "Insufficient payment");

        // Mint all NFTs
        for (uint256 i = 0; i < lazyNFTIds.length; i++) {
            LazyNFT storage lazyNFT = lazyNFTs[lazyNFTIds[i]];
            
            // Verify signature
            bytes32 messageHash = keccak256(abi.encodePacked(
                lazyNFTIds[i],
                recipients[i],
                lazyNFT.price,
                lazyNFT.metadata
            ));
            bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
            
            require(!usedSignatures[ethSignedMessageHash], "Signature already used");
            require(authorizedSigners[ethSignedMessageHash.recover(signatures[i].v, signatures[i].r, signatures[i].s)], "Invalid signature");

            // Mint the NFT
            uint256 tokenId = mintedCounter++;
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, lazyNFT.metadata);

            lazyNFT.isMinted = true;
            usedSignatures[ethSignedMessageHash] = true;

            emit LazyNFTMinted(lazyNFTIds[i], recipients[i], tokenId);
        }

        // Transfer total payment to creators
        if (totalPrice > 0) {
            (bool success, ) = payable(msg.sender).call{value: totalPrice}("");
            require(success, "Payment transfer failed");
        }
    }

    function authorizeSigner(address signer, bool authorized) public onlyOwner {
        authorizedSigners[signer] = authorized;
        emit SignerAuthorized(signer, authorized);
    }

    function getLazyNFT(uint256 lazyNFTId) public view returns (LazyNFT memory) {
        return lazyNFTs[lazyNFTId];
    }

    function getLazyNFTsByCreator(address creator) public view returns (uint256[] memory) {
        uint256[] memory lazyNFTIds = new uint256[](lazyNFTCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < lazyNFTCounter; i++) {
            if (lazyNFTs[i].creator == creator) {
                lazyNFTIds[count] = i;
                count++;
            }
        }
        
        return lazyNFTIds;
    }

    function getUnmintedLazyNFTs() public view returns (uint256[] memory) {
        uint256[] memory lazyNFTIds = new uint256[](lazyNFTCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < lazyNFTCounter; i++) {
            if (!lazyNFTs[i].isMinted) {
                lazyNFTIds[count] = i;
                count++;
            }
        }
        
        return lazyNFTIds;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 