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
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "BL Challenge",
  description: "",
  url: process.env.VERCEL_PROJECT_PRODUCTION_URL || "https://reown.com/appkit", // origin must match your domain & subdomain
  icons: [],
};

// Create the modal
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork,
  metadata: metadata,
});

interface ProvidersProps {
  children: React.ReactNode;
}

const ContextProviders: FunctionComponent<ProvidersProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

export default ContextProviders;
