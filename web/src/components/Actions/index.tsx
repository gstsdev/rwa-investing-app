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
import ExchangeForm from "./ExchangeForm";
import useDepositUsdc from "@/hooks/useDepositUsdc";
import { parseUnits } from "viem";
import useWithdrawUsdc from "@/hooks/useWithdrawUsdc";

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

  const [showDepositForm, toggleDepositForm] = useState(false);
  const [showWithdrawalForm, toggleWithdrawalForm] = useState(false);

  const { depositUsdc, isPending: isDepositing } = useDepositUsdc({
    onSuccess() {
      toggleDepositForm(false);
    },
  });

  const { withdrawUsdc, isPending: isWithdrawing } = useWithdrawUsdc({
    onSuccess() {
      toggleWithdrawalForm(false);
    },
  });

  function handleDepositUsdc(value: string) {
    const unitValue = parseUnits(value, 6);

    depositUsdc({ usdcAmount: unitValue });
  }

  function handleWithdrawUsdc(value: string) {
    const unitValue = parseUnits(value, 6);

    withdrawUsdc({ bltmAmount: unitValue });
  }

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
        {showDepositForm ? (
          <ExchangeForm
            sourceToken={{ symbol: "USDC", decimals: 6 }}
            destToken={{ symbol: bltmSymbol, decimals: 6 }}
            exchangeRate={Number(bltmExchangeRate.data || 0)}
            exchangingLabel="Depositing..."
            buttonLabel="Deposit"
            isExchanging={isDepositing}
            onExchange={handleDepositUsdc}
            onClose={() => toggleDepositForm(false)}
          />
        ) : showWithdrawalForm ? (
          <ExchangeForm
            sourceToken={{ symbol: bltmSymbol, decimals: 6 }}
            destToken={{ symbol: "USDC", decimals: 6 }}
            exchangeRate={1 / Number(bltmExchangeRate.data || 1)}
            exchangingLabel="Withdrawing..."
            buttonLabel="Withdraw"
            isExchanging={isWithdrawing}
            onExchange={handleWithdrawUsdc}
            onClose={() => toggleWithdrawalForm(false)}
          />
        ) : (
          <>
            <ActionButton
              disabled={disabled}
              onClick={() => toggleDepositForm(true)}
            >
              Deposit
            </ActionButton>
            <ActionButton
              disabled={disabled}
              onClick={() => toggleWithdrawalForm(true)}
            >
              Withdraw
            </ActionButton>
          </>
        )}
      </div>
    </div>
  );
};

export default Actions;
