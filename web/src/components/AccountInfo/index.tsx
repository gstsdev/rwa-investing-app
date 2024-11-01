"use client";

import React, { FunctionComponent } from "react";
import ConnectButton from "./ConnectButton";
import WalletInfo from "./WalletInfo";
import BalanceInfo from "./BalanceInfo";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AccountInfoProps {}

const AccountInfo: FunctionComponent<AccountInfoProps> = ({}) => {
  return (
    <div className="flex flex-col w-full items-center">
      <div className="w-fit">
        <ConnectButton />
        <WalletInfo />
      </div>

      <div className="mt-2 w-full">
        <BalanceInfo />
      </div>
    </div>
  );
};

export default AccountInfo;
