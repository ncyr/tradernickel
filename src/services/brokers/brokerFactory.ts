import { BrokerInterface } from './brokerInterface';
import { TradovateBroker } from './tradovate';

// Factory to get the appropriate broker implementation
export function getBroker(brokerName: string, botName?: string): BrokerInterface {
  switch (brokerName.toLowerCase()) {
    case 'tradovate':
      return new TradovateBroker(botName);
    // Add other broker implementations here
    default:
      throw new Error(`Unsupported broker: ${brokerName}`);
  }
}

export default getBroker; 