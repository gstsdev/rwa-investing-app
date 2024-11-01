import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    polygonAmoy: {
      url: vars.get("POLYGON_AMOY_RPC", "https://rpc-amoy.polygon.technology"),
      accounts: [vars.get("ACCOUNT_PRIVATE_KEY")],
    },
    hardhat: {
      forking: {
        enabled: true,
        url: `https://polygon-amoy.g.alchemy.com/v2/${vars.get(
          "ALCHEMY_API_KEY"
        )}`,
        blockNumber: 13536544,
      },
      chains: {
        80002: {
          hardforkHistory: {
            london: 13536544,
          },
        },
      },
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: vars.get("OKLINK_AMOY_API_KEY"),
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL:
            "https://www.oklink.com/api/explorer/v1/contract/verify/async/api/polygonAmoy",
          browserURL: "https://www.oklink.com/polygonAmoy",
        },
      },
    ],
  },
};

export default config;
