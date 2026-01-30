/**
 * Convertit une URI IPFS en URL HTTP accessible
 */
export const ipfsUriToHttpUrl = (ipfsUri: string): string => {
  if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) {
    return ipfsUri;
  }
  const cid = ipfsUri.replace("ipfs://", "");
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

/**
 * Extrait le CID d'une URI IPFS
 */
export const extractCidFromIpfsUri = (ipfsUri: string): string | null => {
  if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) {
    return null;
  }
  return ipfsUri.replace("ipfs://", "");
};
