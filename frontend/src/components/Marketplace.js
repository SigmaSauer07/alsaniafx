import { useEffect, useState } from "react";
import { ethers } from "ethers";
import MARKET_ABI from "../abis/Marketplace.json";
import NFT_ABI from "../abis/NFT.json";

const marketAddress = "YOUR_MARKETPLACE_ADDRESS";
const nftAddress = "YOUR_NFT_ADDRESS";

export default function Marketplace() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(marketAddress, MARKET_ABI, provider);
      const total = await contract.listingId();
      const items = [];
      for (let i = 0; i < Number(total); i++) {
        const listing = await contract.listings(i);
        if (!listing.isSold) items.push({ ...listing, id: i });
      }
      setListings(items);
    };
    fetchListings();
  }, []);

  const buy = async (id, price) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(marketAddress, MARKET_ABI, signer);
    const tx = await contract.buyItem(id, { value: price });
    await tx.wait();
    alert("Bought!");
  };

  return (
    <div>
      {listings.map((l, i) => (
        <div key={i}>
          <p>Token: {l.tokenId.toString()}</p>
          <p>Price: {ethers.formatEther(l.price)} ETH</p>
          <button onClick={() => buy(l.id, l.price)}>Buy</button>
        </div>
      ))}
    </div>
  );
}
