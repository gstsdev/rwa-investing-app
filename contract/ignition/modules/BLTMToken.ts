// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BLTMTokenModule = buildModule("BLTMToken", (m) => {
  const defaultAdmin = m.getParameter("defaultAdmin", m.getAccount(0));
  const pauser = m.getParameter("pauser", m.getAccount(0));
  const minter = m.getParameter("minter", m.getAccount(0));

  const ERC20 = m.contract("BLTM", [defaultAdmin, pauser, minter]);

  return { ERC20 };
});

export default BLTMTokenModule;
