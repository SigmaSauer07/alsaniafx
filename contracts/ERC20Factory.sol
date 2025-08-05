// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract ERC20Factory is
    Initializable,
    ERC20Upgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEAM_ROLE = keccak256("TEAM_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalSupply;
        address creator;
        bool isApproved;
        bool isListed;
        uint256 createdAt;
        uint256 approvalDate;
        address approvedBy;
    }

    struct MarketplaceConfig {
        uint256 platformFeeBps; // 1% = 100, 10% = 1000
        uint256 maxPlatformFeeBps; // Maximum 10%
        address feeRecipient;
        bool feesEnabled;
    }

    mapping(address => TokenInfo) public tokenRegistry;
    mapping(address => bool) public approvedTokens;
    mapping(address => bool) public listedTokens;
    
    MarketplaceConfig public marketplaceConfig;
    
    uint256 public tokenCounter;
    uint256 public approvedTokenCounter;

    event TokenCreated(address indexed tokenAddress, string name, string symbol, address indexed creator);
    event TokenApproved(address indexed tokenAddress, address indexed approver, uint256 timestamp);
    event TokenListed(address indexed tokenAddress, bool isListed);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC20_init("AlsaniaFX ERC20 Factory", "AFX");
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        // Setup initial roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(TEAM_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
        _grantRole(APPROVER_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);

        // Setup marketplace configuration
        marketplaceConfig = MarketplaceConfig({
            platformFeeBps: 100, // 1%
            maxPlatformFeeBps: 1000, // 10%
            feeRecipient: msg.sender,
            feesEnabled: true
        });
    }

    // Token Creation Functions
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals
    ) public whenNotPaused returns (address) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than 0");
        require(decimals <= 18, "Decimals cannot exceed 18");

        // Create new token contract
        ERC20Token newToken = new ERC20Token(name, symbol, initialSupply, decimals, msg.sender);
        address tokenAddress = address(newToken);

        // Register token
        tokenRegistry[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            name: name,
            symbol: symbol,
            totalSupply: initialSupply,
            creator: msg.sender,
            isApproved: false,
            isListed: false,
            createdAt: block.timestamp,
            approvalDate: 0,
            approvedBy: address(0)
        });

        tokenCounter++;

        emit TokenCreated(tokenAddress, name, symbol, msg.sender);
        return tokenAddress;
    }

    // Approval Functions
    function approveToken(address tokenAddress) public whenNotPaused {
        require(hasRole(APPROVER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        require(tokenRegistry[tokenAddress].tokenAddress != address(0), "Token not found");
        require(!tokenRegistry[tokenAddress].isApproved, "Token already approved");

        tokenRegistry[tokenAddress].isApproved = true;
        tokenRegistry[tokenAddress].approvalDate = block.timestamp;
        tokenRegistry[tokenAddress].approvedBy = msg.sender;
        approvedTokens[tokenAddress] = true;
        approvedTokenCounter++;

        emit TokenApproved(tokenAddress, msg.sender, block.timestamp);
    }

    function revokeTokenApproval(address tokenAddress) public whenNotPaused {
        require(hasRole(ADMIN_ROLE, msg.sender), "Only admin can revoke approval");
        require(tokenRegistry[tokenAddress].isApproved, "Token not approved");

        tokenRegistry[tokenAddress].isApproved = false;
        tokenRegistry[tokenAddress].isListed = false;
        approvedTokens[tokenAddress] = false;
        listedTokens[tokenAddress] = false;
        approvedTokenCounter--;

        emit TokenApproved(tokenAddress, msg.sender, block.timestamp);
    }

    // Listing Functions
    function listToken(address tokenAddress) public whenNotPaused {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(TEAM_ROLE, msg.sender), "Not authorized");
        require(tokenRegistry[tokenAddress].isApproved, "Token must be approved first");
        require(!tokenRegistry[tokenAddress].isListed, "Token already listed");

        tokenRegistry[tokenAddress].isListed = true;
        listedTokens[tokenAddress] = true;

        emit TokenListed(tokenAddress, true);
    }

    function unlistToken(address tokenAddress) public whenNotPaused {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(TEAM_ROLE, msg.sender), "Not authorized");
        require(tokenRegistry[tokenAddress].isListed, "Token not listed");

        tokenRegistry[tokenAddress].isListed = false;
        listedTokens[tokenAddress] = false;

        emit TokenListed(tokenAddress, false);
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

    // Role Management
    function grantRole(bytes32 role, address account) public override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        super.grantRole(role, account);
        emit RoleGranted(role, account, msg.sender);
    }

    function revokeRole(bytes32 role, address account) public override {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        super.revokeRole(role, account);
        emit RoleRevoked(role, account, msg.sender);
    }

    // View Functions
    function getTokenInfo(address tokenAddress) public view returns (TokenInfo memory) {
        return tokenRegistry[tokenAddress];
    }

    function getApprovedTokens() public view returns (address[] memory) {
        address[] memory tokens = new address[](approvedTokenCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < tokenCounter; i++) {
            // This is a simplified version - in production you'd maintain a list
            // For now, we'll return an empty array and implement proper tracking
        }
        
        return tokens;
    }

    function getListedTokens() public view returns (address[] memory) {
        address[] memory tokens = new address[](approvedTokenCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < tokenCounter; i++) {
            // This is a simplified version - in production you'd maintain a list
            // For now, we'll return an empty array and implement proper tracking
        }
        
        return tokens;
    }

    function isTokenApproved(address tokenAddress) public view returns (bool) {
        return tokenRegistry[tokenAddress].isApproved;
    }

    function isTokenListed(address tokenAddress) public view returns (bool) {
        return tokenRegistry[tokenAddress].isListed;
    }

    function getPlatformFee() public view returns (uint256) {
        return marketplaceConfig.platformFeeBps;
    }

    function getFeeRecipient() public view returns (address) {
        return marketplaceConfig.feeRecipient;
    }

    // Override required functions
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}

// ERC20 Token Contract
contract ERC20Token is ERC20Upgradeable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals_,
        address owner
    ) {
        __ERC20_init(name, symbol);
        _decimals = decimals_;
        _mint(owner, initialSupply * (10 ** decimals_));
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
} 