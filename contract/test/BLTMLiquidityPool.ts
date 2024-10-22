import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ignition } from "hardhat";
import BLTMLiquidityPoolModule from "../ignition/modules/BLTMLiquidityPool";
import BLTMTokenModule from "../ignition/modules/BLTMToken";

import { contracts } from "../typechain-types";

describe("BLTMLiquidityPool", function () {
  async function deployPoolFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const { ERC20 } = await ignition.deploy(BLTMTokenModule, {
      parameters: {
        BLTMModule: {
          defaultAdmin: owner.address,
          pauser: owner.address,
          minter: owner.address,
        },
      },
    });

    const erc20 = ERC20 as unknown as contracts.BLTM;

    const { LiquidityPool } = await ignition.deploy(BLTMLiquidityPoolModule, {
      parameters: {
        BLTMLiquidityPool: {
          usdcContractAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
          exchangeRate: 1,
        },
      },
    });

    const pool = LiquidityPool as unknown as contracts.BLTMLiquidityPool;

    const [ERC20_MINTER_ROLE] = await Promise.all([erc20.MINTER_ROLE()]);

    const [OWNER_ROLE] = await Promise.all([pool.OWNER_ROLE()]);

    return {
      erc20,
      pool,
      owner,
      otherAccount,
      ERC20_MINTER_ROLE,
      OWNER_ROLE,
    };
  }

  describe("Deployment", function () {
    it("Should set the right roles to the owner", async function () {
      const { pool, owner, OWNER_ROLE } = await loadFixture(deployPoolFixture);

      expect(
        await pool.hasRole(OWNER_ROLE, owner),
        "owner is not assigned OWNER_ROLE"
      ).to.be.true;
    });

    it("Should assign the MINTER_ROLE to the pool in the ERC-20 contract", async function () {
      const { erc20, owner, ERC20_MINTER_ROLE } = await loadFixture(
        deployPoolFixture
      );

      expect(await erc20.hasRole(ERC20_MINTER_ROLE, owner)).to.be.true;
    });
  });

  describe("Exchange Rate", function () {
    it("Should prevent updating the exchange rate if not assigned OWNER_ROLE", async function () {
      const { pool, otherAccount, OWNER_ROLE } = await loadFixture(
        deployPoolFixture
      );

      expect(
        await pool.hasRole(OWNER_ROLE, otherAccount),
        "account is assigned OWNER_ROLE"
      ).to.be.false;

      const LiquidityPool = await hre.ethers.getContractAt(
        "BLTMLiquidityPool",
        await pool.getAddress(),
        otherAccount
      );

      await expect(LiquidityPool.updateExchangeRate(2)).to.reverted;
    });
  });
});
