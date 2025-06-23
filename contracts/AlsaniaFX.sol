// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";

contract AlsaniaFX is Initializable, OwnableUpgradeable, UUPSUpgradeable, ERC2981Upgradeable {
    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        bool isSold;
    }

    uint256 public listingId;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => uint256)) public offers;

    /// ---------------- Events ---------------- ///
    event Listed(uint256 indexed id, address indexed seller, address indexed nft, uint256 tokenId, uint256 price);
    event Sold(uint256 indexed id, address indexed buyer);
    event OfferPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount);
    event OfferAccepted(uint256 indexed listingId, address indexed buyer);

    /// ---------------- Initializer ---------------- ///
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __ERC2981_init();
    }

    /// ---------------- UUPS Upgrade Auth ---------------- ///
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// ---------------- List Item ---------------- ///
    function listItem(address nftAddress, uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be > 0");

        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);

        listings[listingId] = Listing({
            seller: msg.sender,
            nftAddress: nftAddress,
            tokenId: tokenId,
            price: price,
            isSold: false
        });

        emit Listed(listingId, msg.sender, nftAddress, tokenId, price);
        listingId++;
    }

    /// ---------------- Buy Item ---------------- ///
    function buyItem(uint256 _listingId) external payable {
        Listing storage listing = listings[_listingId];
        require(!listing.isSold, "Already sold");
        require(msg.value >= listing.price, "Insufficient funds");

        listing.isSold = true;

        // Handle royalties if supported
        bool royaltyPaid = false;
        try IERC2981(listing.nftAddress).royaltyInfo(listing.tokenId, listing.price) returns (address receiver, uint256 royaltyAmount) {
            if (royaltyAmount > 0) {
                payable(receiver).transfer(royaltyAmount);
                payable(listing.seller).transfer(listing.price - royaltyAmount);
                royaltyPaid = true;
            }
        } catch {
            // Not ERC2981-compliant
        }

        if (!royaltyPaid) {
            payable(listing.seller).transfer(listing.price);
        }

        IERC721(listing.nftAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        emit Sold(_listingId, msg.sender);
    }

    /// ---------------- Offers ---------------- ///
    function placeOffer(uint256 _listingId) external payable {
        require(!listings[_listingId].isSold, "Already sold");
        require(msg.value > 0, "Offer must be > 0");

        offers[_listingId][msg.sender] = msg.value;
        emit OfferPlaced(_listingId, msg.sender, msg.value);
    }

    function acceptOffer(uint256 _listingId, address _bidder) external {
        Listing storage listing = listings[_listingId];
        require(msg.sender == listing.seller, "Only seller can accept offers");

        uint256 offerAmount = offers[_listingId][_bidder];
        require(offerAmount > 0, "No offer to accept");

        listing.isSold = true;
        offers[_listingId][_bidder] = 0;

        payable(listing.seller).transfer(offerAmount);
        IERC721(listing.nftAddress).transferFrom(address(this), _bidder, listing.tokenId);

        emit OfferAccepted(_listingId, _bidder);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC2981Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}