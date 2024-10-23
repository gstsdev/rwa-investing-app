"use client";

import React, { FunctionComponent } from "react";
import ConnectButton from "./ConnectButton";
import WalletInfo from "./WalletInfo";
import BalanceInfo from "./BalanceInfo";

interface AccountInfoProps {}

const AccountInfo: FunctionComponent<AccountInfoProps> = ({}) => {
  return (
    <div className="flex flex-col w-full items-center">
      <div className="w-fit">
        <ConnectButton />
        <WalletInfo />
      </div>
    </div>
  );
};

export default AccountInfo;
