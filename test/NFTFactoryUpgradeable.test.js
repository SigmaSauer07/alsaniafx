const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("NFTFactoryUpgradeable", () => {
  let factory, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("NFTFactoryUpgradeable");
    factory = await upgrades.deployProxy(Factory, [], { initializer: "initialize" });
    await factory.waitForDeployment();
  });

  it("should create a collection and mint ERC721", async () => {
    await factory.createCollection("Collection A", "CA", "", "", true, owner.address, 500);
    await factory.mintNFT(0, "metaA.json", 1, user.address);

    const ownerOf = await factory.ownerOf((0 << 128) | 0);
    expect(ownerOf).to.equal(user.address);
  });

  it("should mint ERC1155 tokens", async () => {
    await factory.createCollection("Collection B", "CB", "", "", false, owner.address, 750);
    await factory.mintNFT(1, "metaB.json", 5, user.address);

    const balance = await factory.balanceOf1155(user.address, (1 << 128) | 0);
    expect(balance).to.equal(5);
  });
});
