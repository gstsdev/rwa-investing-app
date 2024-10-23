"use client";
import useTokenSymbol from "@/hooks/useTokenSymbol";
import {
  BLTM_CONTRACT_ADDRESS,
  BLTM_POOL_CONTRACT_ADDRESS,
} from "@/lib/contracts/addresses";
import BLTMLiquidityPoolContract from "@/lib/contracts/BLTMLiquidityPool";
import { ArrowRightIcon } from "lucide-react";
import React, { FunctionComponent } from "react";
import { twMerge } from "tailwind-merge";
import { useReadContract } from "wagmi";

interface ActionsProps {
  className?: string;
}

const Actions: FunctionComponent<ActionsProps> = ({ className }) => {
  const { data: bltmSymbol } = useTokenSymbol(
    BLTM_CONTRACT_ADDRESS as `0x${string}`,
    "BLTM"
  );

  const bltmExchangeRate = useReadContract({
    address: BLTM_POOL_CONTRACT_ADDRESS as `0x${string}`,
    abi: BLTMLiquidityPoolContract.abi,
    functionName: "exchangeRate",
    args: [],
    query: {
      retry: false,
    },
  });

  return (
    <div
      className={twMerge(
        "flex flex-col w-full max-w-[400px] mx-auto",
        className
      )}
    >
      <h2 className="text-xl text-neutral-400 mb-3">Actions</h2>

      <div className="flex items-center justify-center gap-3 text-lg">
        1 USDC <ArrowRightIcon className="w-5 h-5" />{" "}
        {(bltmExchangeRate.data && Number(bltmExchangeRate.data)) || "..."}{" "}
        {bltmSymbol}
      </div>

      <div className="flex gap-3 mt-10">
        <ActionButton>Deposit</ActionButton>
        <ActionButton>Withdraw</ActionButton>
      </div>
    </div>
  );
};

export default Actions;

interface ActionButtonProps {
  children?: React.ReactNode;
  className?: string;
}

function ActionButton({ children, className }: ActionButtonProps) {
  return (
    <button
      className={twMerge(
        "flex-1 text-xl font-sans font-medium bg-sky-900 hover:bg-sky-800 transition rounded-full py-2 px-3",
        className
      )}
    >
      {children}
    </button>
  );
}
