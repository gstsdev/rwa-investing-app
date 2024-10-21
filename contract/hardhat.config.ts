import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    zkEVM: {
      url: `https://rpc.cardona.zkevm-rpc.com`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY!],
    },
  },
};

export default config;
