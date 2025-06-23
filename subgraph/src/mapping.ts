import {
  Listed as ListedEvent,
  Sold as SoldEvent,
  OfferPlaced as OfferPlacedEvent,
  OfferAccepted as OfferAcceptedEvent,
} from "../generated/Marketplace/Marketplace";
import { Listing, Sale, Offer } from "../generated/schema";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";

export function handleListed(event: ListedEvent): void {
  let entity = new Listing(event.params.id.toString());
  entity.seller = event.params.seller;
  entity.nftAddress = event.params.nft;
  entity.tokenId = event.params.tokenId;
  entity.price = event.params.price;
  entity.isSold = false;
  entity.save();
}

export function handleSold(event: SoldEvent): void {
  let listing = Listing.load(event.params.id.toString());
  if (listing != null) {
    listing.isSold = true;
    listing.save();

    let sale = new Sale(event.transaction.hash.toHex());
    sale.buyer = event.params.buyer;
    sale.tokenId = listing.tokenId;
    sale.price = listing.price;
    sale.timestamp = event.block.timestamp;
    sale.save();
  }
}

export function handleOfferPlaced(event: OfferPlacedEvent): void {
  let id = event.transaction.hash.toHex() + "-" + event.params.bidder.toHex();
  let offer = new Offer(id);
  offer.listingId = event.params.listingId;
  offer.bidder = event.params.bidder;
  offer.amount = event.params.amount;
  offer.timestamp = event.block.timestamp;
  offer.save();
}

export function handleOfferAccepted(event: OfferAcceptedEvent): void {
  let listing = Listing.load(event.params.listingId.toString());
  if (listing != null) {
    listing.isSold = true;
    listing.save();

    let sale = new Sale(event.transaction.hash.toHex());
    sale.buyer = event.params.buyer;
    sale.tokenId = listing.tokenId;
    sale.price = listing.price;
    sale.timestamp = event.block.timestamp;
    sale.save();
  }
}
