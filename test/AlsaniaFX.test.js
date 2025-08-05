const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("AlsaniaFX NFT Marketplace", function () {
  let marketplace;
  let nftFactory;
  let owner;
  let seller;
  let buyer;
  let creator;
  let addrs;

  beforeEach(async function () {
    [owner, seller, buyer, creator, ...addrs] = await ethers.getSigners();

    // Deploy NFT Factory
    const NFTFactory = await ethers.getContractFactory("NFTFactoryUpgradeable");
    nftFactory = await upgrades.deployProxy(NFTFactory, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await nftFactory.waitForDeployment();

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("AlsaniaFX");
    marketplace = await upgrades.deployProxy(Marketplace, [owner.address], {
      initializer: "initialize",
      kind: "uups"
    });
    await marketplace.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct platform fee", async function () {
      expect(await marketplace.platformFeeBps()).to.equal(250); // 2.5%
    });

    it("Should set platform fee recipient", async function () {
      expect(await marketplace.platformFeeRecipient()).to.equal(owner.address);
    });
  });

  describe("NFT Creation", function () {
    it("Should create a collection", async function () {
      const collectionName = "Test Collection";
      const collectionSymbol = "TEST";
      const contractURI = "ipfs://QmTest";
      const baseURI = "ipfs://QmBase/";
      const maxSupply = 1000;
      const mintPrice = ethers.parseEther("0.01");

      const tx = await nftFactory.connect(creator).createCollection(
        collectionName,
        collectionSymbol,
        contractURI,
        baseURI,
        true, // isERC721
        creator.address,
        500, // 5% royalty
        maxSupply,
        mintPrice
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });

    it("Should mint an NFT", async function () {
      // Create collection first
      await nftFactory.connect(creator).createCollection(
        "Test Collection",
        "TEST",
        "ipfs://QmTest",
        "ipfs://QmBase/",
        true,
        creator.address,
        500,
        1000,
        ethers.parseEther("0.01")
      );

      // Mint NFT
      const metadata = "ipfs://QmNFT";
      const attributes = '{"trait_type": "Background", "value": "Blue"}';
      
      const tx = await nftFactory.connect(creator).mintNFT(
        0, // collectionId
        metadata,
        1, // amount
        creator.address,
        attributes
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });
  });

  describe("Marketplace Listing", function () {
    let nftAddress;
    let tokenId;

    beforeEach(async function () {
      // Create and mint an NFT
      await nftFactory.connect(creator).createCollection(
        "Test Collection",
        "TEST",
        "ipfs://QmTest",
        "ipfs://QmBase/",
        true,
        creator.address,
        500,
        1000,
        ethers.parseEther("0.01")
      );

      await nftFactory.connect(creator).mintNFT(
        0,
        "ipfs://QmNFT",
        1,
        creator.address,
        '{"trait_type": "Background", "value": "Blue"}'
      );

      nftAddress = await nftFactory.getAddress();
      tokenId = 0;
    });

    it("Should list an NFT for sale", async function () {
      const price = ethers.parseEther("0.1");
      const metadata = "Test NFT";

      // Approve marketplace to transfer NFT
      await nftFactory.connect(creator).setApprovalForAll(marketplace.getAddress(), true);

      const tx = await marketplace.connect(creator).listItem(
        nftAddress,
        tokenId,
        price,
        false, // not auction
        0, // auction duration
        0, // min bid
        metadata
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      // Check listing
      const listing = await marketplace.getListing(0);
      expect(listing.seller).to.equal(creator.address);
      expect(listing.price).to.equal(price);
      expect(listing.isSold).to.equal(false);
    });

    it("Should list an NFT for auction", async function () {
      const price = ethers.parseEther("0.1");
      const auctionDuration = 3600; // 1 hour
      const minBid = ethers.parseEther("0.05");
      const metadata = "Auction NFT";

      await nftFactory.connect(creator).setApprovalForAll(marketplace.getAddress(), true);

      const tx = await marketplace.connect(creator).listItem(
        nftAddress,
        tokenId,
        price,
        true, // auction
        auctionDuration,
        minBid,
        metadata
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      // Check listing
      const listing = await marketplace.getListing(0);
      expect(listing.isAuction).to.equal(true);
      expect(listing.minBid).to.equal(minBid);
    });

    it("Should fail to list if not approved", async function () {
      const price = ethers.parseEther("0.1");

      await expect(
        marketplace.connect(creator).listItem(
          nftAddress,
          tokenId,
          price,
          false,
          0,
          0,
          "Test"
        )
      ).to.be.revertedWith("Not approved");
    });
  });

  describe("Buying NFTs", function () {
    let listingId;

    beforeEach(async function () {
      // Create and mint NFT
      await nftFactory.connect(creator).createCollection(
        "Test Collection",
        "TEST",
        "ipfs://QmTest",
        "ipfs://QmBase/",
        true,
        creator.address,
        500,
        1000,
        ethers.parseEther("0.01")
      );

      await nftFactory.connect(creator).mintNFT(
        0,
        "ipfs://QmNFT",
        1,
        creator.address,
        '{"trait_type": "Background", "value": "Blue"}'
      );

      // List for sale
      await nftFactory.connect(creator).setApprovalForAll(marketplace.getAddress(), true);
      
      const tx = await marketplace.connect(creator).listItem(
        await nftFactory.getAddress(),
        0,
        ethers.parseEther("0.1"),
        false,
        0,
        0,
        "Test NFT"
      );

      const receipt = await tx.wait();
      listingId = 0;
    });

    it("Should buy an NFT", async function () {
      const price = ethers.parseEther("0.1");
      const buyerInitialBalance = await ethers.provider.getBalance(buyer.address);

      const tx = await marketplace.connect(buyer).buyItem(listingId, {
        value: price
      });

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      // Check NFT ownership
      const nftContract = await ethers.getContractAt("IERC721", await nftFactory.getAddress());
      expect(await nftContract.ownerOf(0)).to.equal(buyer.address);

      // Check listing is sold
      const listing = await marketplace.getListing(listingId);
      expect(listing.isSold).to.equal(true);
    });

    it("Should fail to buy with insufficient funds", async function () {
      const insufficientPrice = ethers.parseEther("0.05");

      await expect(
        marketplace.connect(buyer).buyItem(listingId, {
          value: insufficientPrice
        })
      ).to.be.revertedWith("Insufficient funds");
    });

    it("Should fail to buy auction item with buyItem", async function () {
      // Create auction listing
      await marketplace.connect(creator).listItem(
        await nftFactory.getAddress(),
        0,
        ethers.parseEther("0.1"),
        true, // auction
        3600,
        ethers.parseEther("0.05"),
        "Auction NFT"
      );

      await expect(
        marketplace.connect(buyer).buyItem(1, {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Item is auction");
    });
  });

  describe("Auction System", function () {
    let auctionListingId;

    beforeEach(async function () {
      // Create and mint NFT
      await nftFactory.connect(creator).createCollection(
        "Test Collection",
        "TEST",
        "ipfs://QmTest",
        "ipfs://QmBase/",
        true,
        creator.address,
        500,
        1000,
        ethers.parseEther("0.01")
      );

      await nftFactory.connect(creator).mintNFT(
        0,
        "ipfs://QmNFT",
        1,
        creator.address,
        '{"trait_type": "Background", "value": "Blue"}'
      );

      // List for auction
      await nftFactory.connect(creator).setApprovalForAll(marketplace.getAddress(), true);
      
      const tx = await marketplace.connect(creator).listItem(
        await nftFactory.getAddress(),
        0,
        ethers.parseEther("0.1"),
        true, // auction
        3600, // 1 hour
        ethers.parseEther("0.05"),
        "Auction NFT"
      );

      const receipt = await tx.wait();
      auctionListingId = 0;
    });

    it("Should place a bid", async function () {
      const bidAmount = ethers.parseEther("0.06");

      const tx = await marketplace.connect(buyer).placeBid(auctionListingId, {
        value: bidAmount
      });

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      // Check auction state
      const auction = await marketplace.getAuction(auctionListingId);
      expect(auction.highestBidder).to.equal(buyer.address);
      expect(auction.highestBid).to.equal(bidAmount);
    });

    it("Should fail to bid below minimum", async function () {
      const lowBid = ethers.parseEther("0.03");

      await expect(
        marketplace.connect(buyer).placeBid(auctionListingId, {
          value: lowBid
        })
      ).to.be.revertedWith("Bid too low");
    });

    it("Should fail to bid on non-auction item", async function () {
      // Create regular listing
      await marketplace.connect(creator).listItem(
        await nftFactory.getAddress(),
        0,
        ethers.parseEther("0.1"),
        false, // not auction
        0,
        0,
        "Regular NFT"
      );

      await expect(
        marketplace.connect(buyer).placeBid(1, {
          value: ethers.parseEther("0.06")
        })
      ).to.be.revertedWith("Not an auction");
    });
  });

  describe("Collection Management", function () {
    it("Should register a collection", async function () {
      const collectionAddress = await nftFactory.getAddress();
      const name = "Test Collection";
      const symbol = "TEST";
      const contractURI = "ipfs://QmTest";
      const royaltyBps = 500; // 5%

      const tx = await marketplace.connect(creator).registerCollection(
        collectionAddress,
        name,
        symbol,
        contractURI,
        royaltyBps
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });

    it("Should verify collection", async function () {
      const collectionAddress = await nftFactory.getAddress();
      
      await marketplace.connect(owner).verifyCollection(collectionAddress, true);
      
      // Check verification
      const collection = await marketplace.collections(collectionAddress);
      expect(collection.isVerified).to.equal(true);
    });

    it("Should fail to verify collection as non-owner", async function () {
      const collectionAddress = await nftFactory.getAddress();
      
      await expect(
        marketplace.connect(creator).verifyCollection(collectionAddress, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Admin Functions", function () {
    it("Should set platform fee", async function () {
      const newFee = 300; // 3%
      
      await marketplace.connect(owner).setPlatformFee(newFee);
      
      expect(await marketplace.platformFeeBps()).to.equal(newFee);
    });

    it("Should set platform fee recipient", async function () {
      const newRecipient = addrs[0].address;
      
      await marketplace.connect(owner).setPlatformFeeRecipient(newRecipient);
      
      expect(await marketplace.platformFeeRecipient()).to.equal(newRecipient);
    });

    it("Should pause and unpause marketplace", async function () {
      await marketplace.connect(owner).pause();
      expect(await marketplace.paused()).to.equal(true);
      
      await marketplace.connect(owner).unpause();
      expect(await marketplace.paused()).to.equal(false);
    });

    it("Should fail to set platform fee as non-owner", async function () {
      await expect(
        marketplace.connect(creator).setPlatformFee(300)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("View Functions", function () {
    it("Should get active listings", async function () {
      const listings = await marketplace.getActiveListings();
      expect(Array.isArray(listings)).to.equal(true);
    });

    it("Should get user listings", async function () {
      const listings = await marketplace.getUserListings(creator.address);
      expect(Array.isArray(listings)).to.equal(true);
    });

    it("Should get user bids", async function () {
      const bids = await marketplace.getUserBids(buyer.address);
      expect(Array.isArray(bids)).to.equal(true);
    });
  });

  describe("Upgradeability", function () {
    it("Should upgrade marketplace contract", async function () {
      const MarketplaceV2 = await ethers.getContractFactory("AlsaniaFX");
      
      const upgraded = await upgrades.upgradeProxy(
        await marketplace.getAddress(),
        MarketplaceV2
      );
      
      expect(await upgraded.getAddress()).to.equal(await marketplace.getAddress());
    });

    it("Should upgrade NFT factory contract", async function () {
      const NFTFactoryV2 = await ethers.getContractFactory("NFTFactoryUpgradeable");
      
      const upgraded = await upgrades.upgradeProxy(
        await nftFactory.getAddress(),
        NFTFactoryV2
      );
      
      expect(await upgraded.getAddress()).to.equal(await nftFactory.getAddress());
    });
  });

  describe("Gas Optimization", function () {
    it("Should optimize gas usage for listing", async function () {
      // Create and mint NFT
      await nftFactory.connect(creator).createCollection(
        "Test Collection",
        "TEST",
        "ipfs://QmTest",
        "ipfs://QmBase/",
        true,
        creator.address,
        500,
        1000,
        ethers.parseEther("0.01")
      );

      await nftFactory.connect(creator).mintNFT(
        0,
        "ipfs://QmNFT",
        1,
        creator.address,
        '{"trait_type": "Background", "value": "Blue"}'
      );

      await nftFactory.connect(creator).setApprovalForAll(marketplace.getAddress(), true);

      // Measure gas for listing
      const tx = await marketplace.connect(creator).listItem(
        await nftFactory.getAddress(),
        0,
        ethers.parseEther("0.1"),
        false,
        0,
        0,
        "Test NFT"
      );

      const receipt = await tx.wait();
      console.log("Gas used for listing:", receipt.gasUsed.toString());
      
      expect(receipt.gasUsed).to.be.lt(500000); // Should use less than 500k gas
    });
  });
});
