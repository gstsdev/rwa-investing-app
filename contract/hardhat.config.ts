import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    polygonAmoy: {
      url: vars.get("POLYGON_AMOY_RPC", "https://rpc-amoy.polygon.technology"),
      accounts: [vars.get("ACCOUNT_PRIVATE_KEY")],
    },
  },
};

export default config;
