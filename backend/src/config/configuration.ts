export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/xerty',
  },
  privy: {
    appId: process.env.PRIVY_APP_ID || '',
    appSecret: process.env.PRIVY_APP_SECRET || '',
  },
  ipfs: {
    apiKey: process.env.PINATA_API_KEY || '',
    apiSecret: process.env.PINATA_API_SECRET || '',
    jwt: process.env.PINATA_JWT || '',
    gatewayUrl: process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs',
  },
  blockchain: {
    rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc',
    chainId: parseInt(process.env.CHAIN_ID || '421614', 10),
    issuerRegistryAddress: process.env.ISSUER_REGISTRY_ADDRESS || '',
    certificateSBTAddress: process.env.CERTIFICATE_SBT_ADDRESS || '',
    merkleBatchAddress: process.env.MERKLE_BATCH_ADDRESS || '',
  },
});
