// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import BLTMModule from "./BLTMToken";

const BLTMLiquidityPool = buildModule("BLTMLiquidityPool", (m) => {
  const { ERC20 } = m.useModule(BLTMModule);

  const USDC = m.getParameter("usdcContractAddress");
  const exchangeRate = m.getParameter("exchangeRate");

  const LiquidityPool = m.contract("BLTMLiquidityPool", [
    ERC20,
    USDC,
    exchangeRate,
  ]);

  const MINTER_ROLE = m.staticCall(ERC20, "MINTER_ROLE");

  m.call(ERC20, "grantRole", [MINTER_ROLE, LiquidityPool]);

  return { LiquidityPool };
});

export default BLTMLiquidityPool;
