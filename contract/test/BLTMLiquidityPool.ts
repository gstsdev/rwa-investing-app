import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ignition } from "hardhat";
import BLTMLiquidityPoolModule from "../ignition/modules/BLTMLiquidityPool";
import ERC20Abi from "./ERC20-Abi.json";

import { contracts } from "../typechain-types";

describe("BLTMLiquidityPool", function () {
  async function deployPoolFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const USDC_CONTRACT_ADDRESS = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
    const exchangeRate = 2;

    const { LiquidityPool, ERC20 } = await ignition.deploy(
      BLTMLiquidityPoolModule,
      {
        parameters: {
          BLTMModule: {
            defaultAdmin: owner.address,
            pauser: owner.address,
            minter: owner.address,
          },
          BLTMLiquidityPool: {
            usdcContractAddress: USDC_CONTRACT_ADDRESS,
            exchangeRate,
          },
        },
      }
    );

    const erc20 = ERC20 as unknown as contracts.BLTM;

    const pool =
      LiquidityPool as unknown as contracts.bltmLiquidityPoolSol.BLTMLiquidityPool;

    const [ERC20_MINTER_ROLE] = await Promise.all([erc20.MINTER_ROLE()]);

    const [OWNER_ROLE] = await Promise.all([pool.OWNER_ROLE()]);

    return {
      erc20,
      pool,
      owner,
      otherAccount,
      exchangeRate,
      ERC20_MINTER_ROLE,
      OWNER_ROLE,
      USDC_CONTRACT_ADDRESS,
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

  describe("Token Exchange", function () {
    it("Should mint tokens proportional to the USDC provided and the exchange rate", async function () {
      const { erc20, pool, otherAccount, exchangeRate, USDC_CONTRACT_ADDRESS } =
        await loadFixture(deployPoolFixture);

      const LiquidityPool = await hre.ethers.getContractAt(
        "BLTMLiquidityPool",
        await pool.getAddress(),
        otherAccount
      );

      const USDC = new hre.ethers.Contract(
        USDC_CONTRACT_ADDRESS,
        ERC20Abi,
        otherAccount
      );

      const usdcBalance = await USDC.balanceOf(otherAccount);

      expect(usdcBalance).not.to.equal(0);

      const usdcToExchange = getUSDCValue(5);

      const approveTx = await USDC.approve(LiquidityPool, usdcToExchange);

      await approveTx.wait();

      const exchangeTx = await LiquidityPool.exchangeUsdcForToken(
        usdcToExchange
      );

      await exchangeTx.wait();

      expect(await erc20.balanceOf(otherAccount)).to.equal(
        usdcToExchange * exchangeRate
      );
    });

    it("Should revert if USDC allowance is too low", async function () {
      const { pool, otherAccount } = await loadFixture(deployPoolFixture);

      const LiquidityPool = await hre.ethers.getContractAt(
        "BLTMLiquidityPool",
        await pool.getAddress(),
        otherAccount
      );

      const usdcToExchange = getUSDCValue(5);

      await expect(
        LiquidityPool.exchangeUsdcForToken(usdcToExchange)
      ).to.revertedWith("USDC allowance too low");
    });
  });
});

function getUSDCValue(value: number) {
  return value * 10 ** 6;
}
