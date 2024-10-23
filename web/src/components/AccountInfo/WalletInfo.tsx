"use client";

import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import React, { FunctionComponent } from "react";
import { getTruncateString } from "@/utils/ui-helpers";
import { LogOutIcon } from "lucide-react";

const WalletInfo: FunctionComponent = ({}) => {
  const { isConnected, address } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  return (
    isConnected && (
      <div className="rounded-xl bg-black p-2 flex items-center gap-3">
        <div className="py-2 px-4 rounded-full bg-neutral-800 text-neutral-400 font-medium font-sans text-md">
          {getTruncateString({
            string: `${address}`,
            charsStart: 4,
            charsEnd: 6,
            truncate: "middle",
          })}
        </div>

        <button
          onClick={disconnect}
          className="hover:bg-neutral-950 p-2 rounded-full transition"
        >
          <LogOutIcon />
        </button>
      </div>
    )
  );
};

export default WalletInfo;
