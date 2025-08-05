// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title ERC1155Factory
 * @dev Factory contract for creating and managing ERC-1155 tokens
 */
contract ERC1155Factory is 
    ERC1155Upgradeable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable 
{
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEAM_ROLE = keccak256("TEAM_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Token information
    struct TokenInfo {
        uint256 tokenId;
        string name;
        string symbol;
        string uri;
        uint256 totalSupply;
        bool exists;
        address creator;
        uint256 maxSupply; // 0 means unlimited
        bool transferable;
    }

    // Mapping from token ID to token info
    mapping(uint256 => TokenInfo) public tokens;
    
    // Mapping from creator to their tokens
    mapping(address => uint256[]) public creatorTokens;
    
    // Next token ID
    uint256 public nextTokenId;
    
    // Base URI for token metadata
    string public baseURI;

    // Events
    event TokenCreated(uint256 indexed tokenId, string name, string symbol, address indexed creator);
    event TokenMinted(uint256 indexed tokenId, address indexed to, uint256 amount);
    event TokenBurned(uint256 indexed tokenId, address indexed from, uint256 amount);
    event BaseURIUpdated(string newBaseURI);

    // Custom errors
    error TokenDoesNotExist();
    error TokenAlreadyExists();
    error MaxSupplyExceeded();
    error NotTransferable();
    error InsufficientBalance();
    error Unauthorized();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin) public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(TEAM_ROLE, admin);
        _grantRole(CREATOR_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);

        nextTokenId = 1;
        baseURI = "https://api.alsaniafx.com/metadata/1155/";
    }

    /**
     * @dev Creates a new ERC-1155 token
     * @param name Token name
     * @param symbol Token symbol
     * @param uri Token metadata URI
     * @param maxSupply Maximum supply (0 for unlimited)
     * @param transferable Whether the token is transferable
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory uri,
        uint256 maxSupply,
        bool transferable
    ) external whenNotPaused returns (uint256) {
        if (!hasRole(CREATOR_ROLE, msg.sender) && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert Unauthorized();
        }

        uint256 tokenId = nextTokenId;
        nextTokenId++;

        if (tokens[tokenId].exists) {
            revert TokenAlreadyExists();
        }

        tokens[tokenId] = TokenInfo({
            tokenId: tokenId,
            name: name,
            symbol: symbol,
            uri: uri,
            totalSupply: 0,
            exists: true,
            creator: msg.sender,
            maxSupply: maxSupply,
            transferable: transferable
        });

        creatorTokens[msg.sender].push(tokenId);

        emit TokenCreated(tokenId, name, symbol, msg.sender);
        return tokenId;
    }

    /**
     * @dev Mints tokens to a specific address
     * @param tokenId ID of the token to mint
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(
        uint256 tokenId,
        address to,
        uint256 amount
    ) external whenNotPaused nonReentrant {
        if (!hasRole(MINTER_ROLE, msg.sender) && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert Unauthorized();
        }

        if (!tokens[tokenId].exists) {
            revert TokenDoesNotExist();
        }

        if (tokens[tokenId].maxSupply > 0 && 
            tokens[tokenId].totalSupply + amount > tokens[tokenId].maxSupply) {
            revert MaxSupplyExceeded();
        }

        tokens[tokenId].totalSupply += amount;
        _mint(to, tokenId, amount, "");

        emit TokenMinted(tokenId, to, amount);
    }

    /**
     * @dev Burns tokens from a specific address
     * @param tokenId ID of the token to burn
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burn(
        uint256 tokenId,
        address from,
        uint256 amount
    ) external whenNotPaused {
        if (!hasRole(MINTER_ROLE, msg.sender) && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert Unauthorized();
        }

        if (!tokens[tokenId].exists) {
            revert TokenDoesNotExist();
        }

        if (balanceOf(from, tokenId) < amount) {
            revert InsufficientBalance();
        }

        tokens[tokenId].totalSupply -= amount;
        _burn(from, tokenId, amount);

        emit TokenBurned(tokenId, from, amount);
    }

    /**
     * @dev Batch mint function
     * @param tokenIds Array of token IDs
     * @param to Address to mint to
     * @param amounts Array of amounts
     */
    function batchMint(
        uint256[] memory tokenIds,
        address to,
        uint256[] memory amounts
    ) external whenNotPaused nonReentrant {
        if (!hasRole(MINTER_ROLE, msg.sender) && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert Unauthorized();
        }

        require(tokenIds.length == amounts.length, "Arrays length mismatch");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            uint256 amount = amounts[i];

            if (!tokens[tokenId].exists) {
                revert TokenDoesNotExist();
            }

            if (tokens[tokenId].maxSupply > 0 && 
                tokens[tokenId].totalSupply + amount > tokens[tokenId].maxSupply) {
                revert MaxSupplyExceeded();
            }

            tokens[tokenId].totalSupply += amount;
            emit TokenMinted(tokenId, to, amount);
        }

        _mintBatch(to, tokenIds, amounts, "");
    }

    /**
     * @dev Override transfer functions to check transferability
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        // Check transferability before calling parent
        for (uint256 i = 0; i < ids.length; i++) {
            if (from != address(0) && to != address(0)) { // Skip mint/burn
                if (!tokens[ids[i]].transferable) {
                    revert NotTransferable();
                }
            }
        }
        
        super._update(from, to, ids, values);
    }

    /**
     * @dev Returns the URI for a token ID
     */
    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        if (!tokens[tokenId].exists) {
            revert TokenDoesNotExist();
        }

        if (bytes(tokens[tokenId].uri).length > 0) {
            return tokens[tokenId].uri;
        }

        // Convert tokenId to string without using Strings library
        return string(abi.encodePacked(baseURI, _toString(tokenId)));
    }

    /**
     * @dev Internal function to convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }

    /**
     * @dev Returns token information
     */
    function getTokenInfo(uint256 tokenId) external view returns (TokenInfo memory) {
        if (!tokens[tokenId].exists) {
            revert TokenDoesNotExist();
        }
        return tokens[tokenId];
    }

    /**
     * @dev Returns all tokens created by a creator
     */
    function getCreatorTokens(address creator) external view returns (uint256[] memory) {
        return creatorTokens[creator];
    }

    /**
     * @dev Updates the base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyRole(ADMIN_ROLE) {
        baseURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Required by the OZ UUPS module
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    /**
     * @dev Required by the OZ AccessControl module
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlUpgradeable, ERC1155Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 