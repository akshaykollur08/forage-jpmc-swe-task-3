import { ServerRespond } from './DataStreamer';

export interface Row
{
  // This is needed to determine the structure of the object returned by the generateRow method
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined






}


export class DataManipulator
{
  static generateRow(serverRespond: ServerRespond[]): Row
  {
    //Creation of price constants for the ticker ABC and DEF stock
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;

    //Creation of the ratio constant that is simply ABC price over DEF price
    const ratio = priceABC / priceDEF;
    // The threshold is +-10% of the 12 month historical average ratio
    const upperBound = 1 + 0.1;
    const lowerBound = 1 - 0.1;

    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };

  }
}
