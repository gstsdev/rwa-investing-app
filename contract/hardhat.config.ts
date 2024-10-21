import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    polygonAmoy: {
      url:
        process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      accounts: [process.env.ACCOUNT_PRIVATE_KEY!],
    },
  },
};

export default config;
