import MintNFT from "./components/MintNFT";
import ListNFT from "./components/ListNFT";
import Marketplace from "./components/Marketplace";

export default function App() {
  return (
    <div>
      <h1>Mini OpenSea Clone</h1>
      <MintNFT />
      <ListNFT />
      <Marketplace />
    </div>
  );
}
