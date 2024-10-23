import useTokenBalance from "@/hooks/useTokenBalance";
import {
  BLTM_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
} from "@/lib/contracts/addresses";
import { FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

interface BalanceInfoProps {}

const BalanceInfo: FunctionComponent<BalanceInfoProps> = ({}) => {
  const { isConnected } = useAccount();
  // const usdcBalance = useTokenBalance(USDC_CONTRACT_ADDRESS as `0x${string}`, {
  //   defaultDecimals: 6,
  //   defaultSymbol: "USDC",
  // });
  const bltmBalance = useTokenBalance(BLTM_CONTRACT_ADDRESS as `0x${string}`, {
    defaultDecimals: 6,
    defaultSymbol: "BLTM",
  });

  const balances = [bltmBalance]
    .map((balance) => balance.data)
    .filter((data): data is NonNullable<typeof data> => data != null);
  const disabled = !isConnected || bltmBalance.isLoading;

  return (
    <div
      className={twMerge(
        "flex flex-col w-full max-w-[400px] mx-auto",
        disabled && "opacity-60"
      )}
    >
      <h2 className="text-lg text-neutral-500">Balance</h2>

      <div className="flex flex-col md:flex-row gap-3">
        {balances.map((balance) => (
          <CurrencyBalance key={balance.symbol} {...balance} />
        ))}
      </div>
    </div>
  );
};

export default BalanceInfo;

interface CurrencyBalanceProps {
  value: bigint | number;
  symbol: string;
  decimals?: number;
}

function CurrencyBalance({
  value,
  symbol: currency,
  decimals = 1,
}: CurrencyBalanceProps) {
  return (
    <div className="rounded-md bg-neutral-900 p-2 flex-1">
      <p className="text-2xl">
        {formatUnits(BigInt(value), decimals)} {currency.toUpperCase()}
      </p>
    </div>
  );
}
