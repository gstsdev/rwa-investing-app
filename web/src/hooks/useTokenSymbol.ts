import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";

export default function useTokenSymbol(
  tokenAddress: `0x${string}`,
  fallbackSymbol?: string
) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
    args: [],
    query: {
      placeholderData: fallbackSymbol,
    },
  });
}
