const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("AlsaniaFX", function () {
  let owner, seller, buyer, bidder, nft, marketplace;

  beforeEach(async () => {
    [owner, seller, buyer, bidder] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("TestERC721");
    nft = await NFT.connect(seller).deploy("TestNFT", "TNFT");
    await nft.waitForDeployment();

    const AlsaniaFX = await ethers.getContractFactory("AlsaniaFX");
    marketplace = await upgrades.deployProxy(AlsaniaFX, [owner.address], { initializer: 'initialize' });
    await marketplace.waitForDeployment();
  });

  it("should list an ERC721 NFT", async () => {
    await nft.connect(seller).mint(1);
    await nft.connect(seller).approve(marketplace, 1);
    await marketplace.connect(seller).listItem(nft, 1, ethers.parseEther("1"));

    const listing = await marketplace.listings(0);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.tokenId).to.equal(1);
  });

  it("should transfer royalty during purchase", async () => {
    // Simulate royalty-compliant NFT
    const RoyaltyNFT = await ethers.getContractFactory("RoyaltyMockNFT");
    const royaltyNft = await RoyaltyNFT.connect(seller).deploy();
    await royaltyNft.connect(seller).mint(1);
    await royaltyNft.connect(seller).approve(marketplace, 1);

    await marketplace.connect(seller).listItem(royaltyNft, 1, ethers.parseEther("2"));
    await expect(() =>
      marketplace.connect(buyer).buyItem(0, { value: ethers.parseEther("2") })
    ).to.changeEtherBalances(
      [seller, buyer],
      [ethers.parseEther("1.9"), -ethers.parseEther("2")] // 5% royalty
    );
  });

  it("should allow and accept an offer", async () => {
    await nft.connect(seller).mint(2);
    await nft.connect(seller).approve(marketplace, 2);
    await marketplace.connect(seller).listItem(nft, 2, ethers.parseEther("1"));

    await marketplace.connect(bidder).placeOffer(0, { value: ethers.parseEther("1.2") });
    await marketplace.connect(seller).acceptOffer(0, bidder.address);

    expect(await nft.ownerOf(2)).to.equal(bidder.address);
  });

  it("should revert if trying to buy already sold NFT", async () => {
    await nft.connect(seller).mint(3);
    await nft.connect(seller).approve(marketplace, 3);
    await marketplace.connect(seller).listItem(nft, 3, ethers.parseEther("1"));
    await marketplace.connect(buyer).buyItem(0, { value: ethers.parseEther("1") });

    await expect(
      marketplace.connect(buyer).buyItem(0, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("Already sold");
  });
});
