// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BLTMModule = buildModule("BLTMModule", (m) => {
  const defaultAdmin = m.getParameter("defaultAdmin");
  const pauser = m.getParameter("pauser");
  const minter = m.getParameter("minter");

  const ERC20 = m.contract("BLTM", [defaultAdmin, pauser, minter]);

  return { ERC20 };
});

export default BLTMModule;
