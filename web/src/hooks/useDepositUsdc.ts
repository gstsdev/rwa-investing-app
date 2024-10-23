import {
  BLTM_POOL_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
} from "@/lib/contracts/addresses";
import BLTMLiquidityPoolContract from "@/lib/contracts/BLTMLiquidityPool";
import { useMutation } from "@tanstack/react-query";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { erc20Abi } from "viem";
import { useConfig } from "wagmi";

interface DepositUsdcOptions {
  onSuccess?(): any;
}

export default function useDepositUsdc({ onSuccess }: DepositUsdcOptions = {}) {
  const wagmiConfig = useConfig();

  const { mutate: depositUsdc, ...result } = useMutation({
    async mutationFn({ usdcAmount }: { usdcAmount: number | bigint }) {
      const { request: approveRequest } = await simulateContract(wagmiConfig, {
        address: USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [BLTM_POOL_CONTRACT_ADDRESS as `0x${string}`, BigInt(usdcAmount)],
      });

      const approveTxHash = await writeContract(wagmiConfig, approveRequest);

      await waitForTransactionReceipt(wagmiConfig, {
        hash: approveTxHash,
      });

      const { request: exchangeRequest } = await simulateContract(wagmiConfig, {
        address: BLTM_POOL_CONTRACT_ADDRESS as `0x${string}`,
        abi: BLTMLiquidityPoolContract.abi,
        functionName: "exchangeUsdcForToken",
        args: [BigInt(usdcAmount)],
      });

      const exchangeTxHash = await writeContract(wagmiConfig, exchangeRequest);

      await waitForTransactionReceipt(wagmiConfig, { hash: exchangeTxHash });
    },
    onSuccess() {
      onSuccess?.();
    },
  });

  return { depositUsdc, ...result };
}
