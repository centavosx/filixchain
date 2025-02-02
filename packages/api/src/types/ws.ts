export type WsError = {
  statusCode: number;
  data: {
    message: string;
  };
};

export type WsNewBlockInfo = {
  isNewBlock: boolean;
  details: {
    transaction: string[];
    activeBlockHash: string;
    targetHash: string;
    currentHeight: number;
    mintNonce: number;
    currentSupply: number;
  };
};

export type WsMineSuccessful = { hash: string; earned: string };
