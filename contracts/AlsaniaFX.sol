// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract AlsaniaFX is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    ERC2981Upgradeable,
    UUPSUpgradeable
{
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEAM_ROLE = keccak256("TEAM_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

    struct Listing {
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
        bool isAuction;
        uint256 auctionEndTime;
        uint256 minBid;
        uint256 highestBid;
        address highestBidder;
        string metadata;
        uint256 createdAt;
    }

    struct Auction {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 startPrice;
        uint256 endTime;
        uint256 highestBid;
        address highestBidder;
        bool ended;
        uint256 createdAt;
    }

    struct MarketplaceConfig {
        uint256 platformFeeBps; // 1% = 100, 10% = 1000
        uint256 maxPlatformFeeBps; // Maximum 10%
        address feeRecipient;
        bool feesEnabled;
        address erc20Factory;
        bool erc20TradingEnabled;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(address => bool) public approvedERC20Tokens;
    mapping(address => mapping(uint256 => bool)) public nftListed;

    MarketplaceConfig public marketplaceConfig;
    
    uint256 public listingCounter;
    uint256 public auctionCounter;

    // Events
    event ItemListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price);
    event ItemSold(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event AuctionCreated(uint256 indexed auctionId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 startPrice, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 bidAmount);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 winningBid);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event ERC20TokenApproved(address indexed tokenAddress, bool approved);
    event ERC20TradingToggled(bool enabled);

    // Custom errors
    error ListingNotFound();
    error ListingNotActive();
    error InsufficientFunds();
    error BidTooLow();
    error AuctionNotActive();
    error AuctionAlreadyEnded();
    error NotListingOwner();
    error NotApproved();
    error TokenNotApproved();
    error TradingDisabled();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _owner) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __ERC2981_init();

        // Setup initial roles
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(ADMIN_ROLE, _owner);
        _grantRole(TEAM_ROLE, _owner);
        _grantRole(MODERATOR_ROLE, _owner);
        _grantRole(APPROVER_ROLE, _owner);
        _grantRole(CREATOR_ROLE, _owner);

        // Setup marketplace configuration
        marketplaceConfig = MarketplaceConfig({
            platformFeeBps: 100, // 1%
            maxPlatformFeeBps: 1000, // 10%
            feeRecipient: _owner,
            feesEnabled: true,
            erc20Factory: address(0),
            erc20TradingEnabled: false
        });
    }

    // Role Management
    function grantRole(bytes32 role, address account) public override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        super.grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        super.revokeRole(role, account);
    }

    // Marketplace Configuration
    function setPlatformFee(uint256 newFeeBps) public whenNotPaused {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can set platform fee");
        require(newFeeBps <= marketplaceConfig.maxPlatformFeeBps, "Fee exceeds maximum");
        require(newFeeBps >= 0, "Fee cannot be negative");

        uint256 oldFee = marketplaceConfig.platformFeeBps;
        marketplaceConfig.platformFeeBps = newFeeBps;

        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    function setFeeRecipient(address newRecipient) public whenNotPaused {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can set fee recipient");
        require(newRecipient != address(0), "Invalid recipient address");

        address oldRecipient = marketplaceConfig.feeRecipient;
        marketplaceConfig.feeRecipient = newRecipient;

        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    function toggleFees(bool enabled) public whenNotPaused {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can toggle fees");
        marketplaceConfig.feesEnabled = enabled;
    }

    function setERC20Factory(address factoryAddress) public whenNotPaused {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can set ERC20 factory");
        marketplaceConfig.erc20Factory = factoryAddress;
    }

    function toggleERC20Trading(bool enabled) public whenNotPaused {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can toggle ERC20 trading");
        marketplaceConfig.erc20TradingEnabled = enabled;
        emit ERC20TradingToggled(enabled);
    }

    // ERC20 Token Management
    function approveERC20Token(address tokenAddress, bool approved) public whenNotPaused {
        require(hasRole(APPROVER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        approvedERC20Tokens[tokenAddress] = approved;
        emit ERC20TokenApproved(tokenAddress, approved);
    }

    // Listing Functions
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        bool isAuction,
        uint256 auctionDuration,
        uint256 minBid,
        string memory metadata
    ) external whenNotPaused {
        require(price > 0, "Price must be greater than 0");
        require(!nftListed[nftContract][tokenId], "NFT already listed");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Not approved");

        uint256 listingId = listingCounter++;
        
        listings[listingId] = Listing({
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true,
            isAuction: isAuction,
            auctionEndTime: isAuction ? block.timestamp + auctionDuration : 0,
            minBid: minBid,
            highestBid: 0,
            highestBidder: address(0),
            metadata: metadata,
            createdAt: block.timestamp
        });

        nftListed[nftContract][tokenId] = true;

        emit ItemListed(listingId, nftContract, tokenId, msg.sender, price);
    }

    function buyItem(uint256 listingId) external payable whenNotPaused listingExists(listingId) listingActive(listingId) nonReentrant {
        Listing storage listing = listings[listingId];
        require(!listing.isAuction, "Item is auction");
        require(msg.value >= listing.price, "Insufficient payment");

        _processPurchase(listingId, msg.sender, listing.price);
    }

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration,
        string memory metadata
    ) external whenNotPaused {
        require(startPrice > 0, "Start price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(!nftListed[nftContract][tokenId], "NFT already listed");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Not approved");

        uint256 auctionId = auctionCounter++;
        
        auctions[auctionId] = Auction({
            listingId: auctionId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            startPrice: startPrice,
            endTime: block.timestamp + duration,
            highestBid: 0,
            highestBidder: address(0),
            ended: false,
            createdAt: block.timestamp
        });

        nftListed[nftContract][tokenId] = true;

        emit AuctionCreated(auctionId, nftContract, tokenId, msg.sender, startPrice, block.timestamp + duration);
    }

    function placeBid(uint256 auctionId) external payable whenNotPaused auctionExists(auctionId) auctionActive(auctionId) nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");
        require(msg.sender != auction.seller, "Seller cannot bid");

        if (auction.highestBidder != address(0)) {
            // Refund previous bidder
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    function endAuction(uint256 auctionId) external whenNotPaused auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.ended, "Auction already ended");
        require(msg.sender == auction.seller || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            _processAuctionEnd(auctionId);
        }

        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
    }

    // ERC20 Trading Functions
    function buyWithERC20(uint256 listingId, address erc20Token, uint256 amount) external whenNotPaused listingExists(listingId) listingActive(listingId) nonReentrant {
        require(marketplaceConfig.erc20TradingEnabled, "ERC20 trading disabled");
        require(approvedERC20Tokens[erc20Token], "Token not approved");

        Listing storage listing = listings[listingId];
        require(!listing.isAuction, "Item is auction");

        IERC20 token = IERC20(erc20Token);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        _processERC20Purchase(listingId, msg.sender, erc20Token, amount);
    }

    // Internal Functions
    function _processPurchase(uint256 listingId, address buyer, uint256 price) internal {
        Listing storage listing = listings[listingId];
        
        uint256 platformFee = 0;
        if (marketplaceConfig.feesEnabled) {
            platformFee = (price * marketplaceConfig.platformFeeBps) / 10000;
        }
        
        uint256 sellerAmount = price - platformFee;

        // Transfer NFT
        IERC721(listing.nftContract).transferFrom(listing.seller, buyer, listing.tokenId);
        
        // Transfer funds
        if (platformFee > 0) {
            payable(marketplaceConfig.feeRecipient).transfer(platformFee);
        }
        payable(listing.seller).transfer(sellerAmount);

        listing.isActive = false;
        nftListed[listing.nftContract][listing.tokenId] = false;

        emit ItemSold(listingId, listing.nftContract, listing.tokenId, listing.seller, buyer, price);
    }

    function _processERC20Purchase(uint256 listingId, address buyer, address erc20Token, uint256 amount) internal {
        Listing storage listing = listings[listingId];
        
        uint256 platformFee = 0;
        if (marketplaceConfig.feesEnabled) {
            platformFee = (amount * marketplaceConfig.platformFeeBps) / 10000;
        }
        
        uint256 sellerAmount = amount - platformFee;

        // Transfer NFT
        IERC721(listing.nftContract).transferFrom(listing.seller, buyer, listing.tokenId);
        
        // Transfer ERC20 tokens
        IERC20 token = IERC20(erc20Token);
        if (platformFee > 0) {
            token.transfer(marketplaceConfig.feeRecipient, platformFee);
        }
        token.transfer(listing.seller, sellerAmount);

        listing.isActive = false;
        nftListed[listing.nftContract][listing.tokenId] = false;

        emit ItemSold(listingId, listing.nftContract, listing.tokenId, listing.seller, buyer, amount);
    }

    function _processAuctionEnd(uint256 auctionId) internal {
        Auction storage auction = auctions[auctionId];
        
        uint256 platformFee = 0;
        if (marketplaceConfig.feesEnabled) {
            platformFee = (auction.highestBid * marketplaceConfig.platformFeeBps) / 10000;
        }
        
        uint256 sellerAmount = auction.highestBid - platformFee;

        // Transfer NFT
        IERC721(auction.nftContract).transferFrom(auction.seller, auction.highestBidder, auction.tokenId);
        
        // Transfer funds
        if (platformFee > 0) {
            payable(marketplaceConfig.feeRecipient).transfer(platformFee);
        }
        payable(auction.seller).transfer(sellerAmount);

        nftListed[auction.nftContract][auction.tokenId] = false;
    }

    // Modifiers
    modifier listingExists(uint256 listingId) {
        if (listings[listingId].seller == address(0)) revert ListingNotFound();
        _;
    }

    modifier listingActive(uint256 listingId) {
        if (!listings[listingId].isActive) revert ListingNotActive();
        _;
    }

    modifier auctionExists(uint256 auctionId) {
        if (auctions[auctionId].seller == address(0)) revert ListingNotFound();
        _;
    }

    modifier auctionActive(uint256 auctionId) {
        if (auctions[auctionId].ended) revert AuctionAlreadyEnded();
        _;
    }

    // View Functions
    function getListing(uint256 listingId) public view returns (Listing memory) {
        return listings[listingId];
    }

    function getAuction(uint256 auctionId) public view returns (Auction memory) {
        return auctions[auctionId];
    }

    function getPlatformFee() public view returns (uint256) {
        return marketplaceConfig.platformFeeBps;
    }

    function getFeeRecipient() public view returns (address) {
        return marketplaceConfig.feeRecipient;
    }

    function isERC20TokenApproved(address tokenAddress) public view returns (bool) {
        return approvedERC20Tokens[tokenAddress];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlUpgradeable, ERC2981Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}