import { createClient, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

// Default to studionet for easy testing
export const DEFAULT_RPC = studionet.rpcUrls.default.http[0];

export const getGenLayerClient = (rpcUrl: string = DEFAULT_RPC) => {
  return createClient({
    endpoint: rpcUrl,
    account: createAccount(), // Generates a random transient account for demo
  });
};
