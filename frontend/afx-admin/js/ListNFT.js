import { useState } from "react";
import { ethers } from "ethers";
import MARKET_ABI from "../abis/Marketplace.json";
import NFT_ABI from "../abis/NFT.json";

const marketAddress = "YOUR_MARKETPLACE_ADDRESS";
const nftAddress = "YOUR_NFT_ADDRESS";

export default function ListNFT() {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");

  const list = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const nft = new ethers.Contract(nftAddress, NFT_ABI, signer);
    await nft.approve(marketAddress, tokenId);

    const market = new ethers.Contract(marketAddress, MARKET_ABI, signer);
    const tx = await market.listItem(nftAddress, tokenId, ethers.parseEther(price));
    await tx.wait();

    alert("NFT Listed!");
  };

  return (
    <div>
      <input placeholder="Token ID" onChange={e => setTokenId(e.target.value)} />
      <input placeholder="Price in ETH" onChange={e => setPrice(e.target.value)} />
      <button onClick={list}>List</button>
    </div>
  );
}
