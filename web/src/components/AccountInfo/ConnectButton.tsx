"use client";

import { defaultNetwork } from "@/lib/wallet-connector/config";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import React, { FunctionComponent } from "react";
import { useAccountEffect, useSwitchChain } from "wagmi";

const ConnectButton: FunctionComponent = ({}) => {
  const { isConnected, status } = useAppKitAccount();
  const { switchChain } = useSwitchChain();
  const { open } = useAppKit();

  useAccountEffect({
    onConnect(account) {
      if (account.chainId !== defaultNetwork.id) {
        switchChain({
          chainId: defaultNetwork.id,
        });
      }
    },
  });

  return (
    !isConnected &&
    status !== "connecting" &&
    status !== "reconnecting" && (
      <button
        className="px-3 py-3 bg-blue-700 hover:bg-blue-600 transition font-sans font-medium rounded-full"
        onClick={() => open({ view: "Connect" })}
      >
        Connect your wallet
      </button>
    )
  );
};

export default ConnectButton;
