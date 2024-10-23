import {
  BLTM_CONTRACT_ADDRESS,
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

interface WithdrawUsdcOptions {
  onSuccess?(): any;
}

export default function useWithdrawUsdc({
  onSuccess,
}: WithdrawUsdcOptions = {}) {
  const wagmiConfig = useConfig();

  const { mutate: withdrawUsdc, ...result } = useMutation({
    async mutationFn({ bltmAmount }: { bltmAmount: number | bigint }) {
      const { request: approveRequest } = await simulateContract(wagmiConfig, {
        address: BLTM_CONTRACT_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [BLTM_POOL_CONTRACT_ADDRESS as `0x${string}`, BigInt(bltmAmount)],
      });

      const approveTxHash = await writeContract(wagmiConfig, approveRequest);

      await waitForTransactionReceipt(wagmiConfig, {
        hash: approveTxHash,
      });

      const { request: exchangeRequest } = await simulateContract(wagmiConfig, {
        address: BLTM_POOL_CONTRACT_ADDRESS as `0x${string}`,
        abi: BLTMLiquidityPoolContract.abi,
        functionName: "exchangeTokenForUsdc",
        args: [BigInt(bltmAmount)],
      });

      const exchangeTxHash = await writeContract(wagmiConfig, exchangeRequest);

      await waitForTransactionReceipt(wagmiConfig, { hash: exchangeTxHash });
    },
    onSuccess() {
      onSuccess?.();
    },
  });

  return { withdrawUsdc, ...result };
}
