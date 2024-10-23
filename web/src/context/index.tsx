"use client";

import {
  config,
  projectId,
  networks,
  defaultNetwork,
  wagmiAdapter,
} from "@/lib/wallet-connector/config";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type FunctionComponent } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "BL Challenge",
  description: "AppKit Example",
  url: "https://reown.com/appkit", // origin must match your domain & subdomain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// Create the modal
const _modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork,
  metadata: metadata,
});

interface ProvidersProps {
  children: React.ReactNode;
  cookies: string | null;
}

const ContextProviders: FunctionComponent<ProvidersProps> = ({
  children,
  cookies,
}) => {
  const initialState = cookieToInitialState(config, cookies);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

export default ContextProviders;
