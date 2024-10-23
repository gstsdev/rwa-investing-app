"use client";

import { erc20Abi } from "viem";
import { useAccount, useReadContracts } from "wagmi";

type TokenBalanceOptions = {
  defaultSymbol: string;
  defaultDecimals?: number;
};

export default function useTokenBalance(
  tokenAddress: `0x${string}`,
  options?: TokenBalanceOptions
) {
  const { address } = useAccount();

  const result = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: address && [address],
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      },
    ],
    query: {
      enabled: address != null,
    },
  });

  const data = result.data
    ? {
        value: result.data[0],
        decimals: result.data[1],
        symbol: result.data[2],
      }
    : (options &&
        "defaultSymbol" in options && {
          value: BigInt(0),
          decimals: options.defaultDecimals,
          symbol: options.defaultSymbol,
        }) ||
      undefined;

  return { ...result, data };
}
