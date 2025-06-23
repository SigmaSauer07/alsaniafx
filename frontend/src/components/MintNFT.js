import { useState } from "react";
import { ethers } from "ethers";
import NFT_ABI from "../abis/NFT.json";

const nftAddress = "YOUR_DEPLOYED_NFT_ADDRESS";

export default function MintNFT() {
  const [tokenURI, setTokenURI] = useState("");

  const mint = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(nftAddress, NFT_ABI, signer);
    const tx = await contract.mintNFT(tokenURI);
    await tx.wait();
    alert("Minted!");
  };

  return (
    <div>
      <input onChange={e => setTokenURI(e.target.value)} placeholder="IPFS URI" />
      <button onClick={mint}>Mint</button>
    </div>
  );
}
