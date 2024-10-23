"use client";
import useTokenSymbol from "@/hooks/useTokenSymbol";
import {
  BLTM_CONTRACT_ADDRESS,
  BLTM_POOL_CONTRACT_ADDRESS,
} from "@/lib/contracts/addresses";
import BLTMLiquidityPoolContract from "@/lib/contracts/BLTMLiquidityPool";
import { ArrowRightIcon } from "lucide-react";
import React, { FunctionComponent, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useAccount, useReadContract } from "wagmi";
import ActionButton from "./ActionButton";
import DepositForm from "./DepositForm";

interface ActionsProps {
  className?: string;
}

const Actions: FunctionComponent<ActionsProps> = ({ className }) => {
  const { isConnected } = useAccount();

  const disabled = !isConnected;

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

  const [isDepositing, setDepositing] = useState(false);

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
        {isDepositing ? (
          <DepositForm
            sourceToken={{ symbol: "USDC", decimals: 6 }}
            destToken={{ symbol: bltmSymbol, decimals: 6 }}
            exchangeRate={Number(bltmExchangeRate.data || 0)}
            onClose={() => setDepositing(false)}
          />
        ) : (
          <>
            <ActionButton
              disabled={disabled}
              onClick={() => setDepositing(true)}
            >
              Deposit
            </ActionButton>
            <ActionButton disabled={disabled}>Withdraw</ActionButton>
          </>
        )}
      </div>
    </div>
  );
};

export default Actions;
