import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ignition } from "hardhat";
import BLTMLiquidityPoolModule from "../ignition/modules/BLTMLiquidityPool";
import ERC20Abi from "./ERC20-Abi.json";

import { contracts } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

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

    it("Should prevent updating the exchange rate to 0", async function () {
      const { pool } = await loadFixture(deployPoolFixture);

      await expect(pool.updateExchangeRate(0)).to.reverted;
    });
  });

  describe("Exchange USDC", function () {
    it("Should mint tokens proportional to the USDC provided and the exchange rate", async function () {
      const { erc20, pool, otherAccount, exchangeRate, USDC_CONTRACT_ADDRESS } =
        await loadFixture(deployPoolFixture);

      const { usdcToExchange } = await exchangeUsdc(
        pool,
        otherAccount,
        USDC_CONTRACT_ADDRESS,
        5
      );

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

  describe("Exchange BLTM", function () {
    it("Should transfer USDC proportional to the BLTM amount provided (with royalties deduced)", async function () {
      const { erc20, pool, otherAccount, exchangeRate, USDC_CONTRACT_ADDRESS } =
        await loadFixture(deployPoolFixture);

      const { LiquidityPool, USDC, usdcBalance, usdcToExchange } =
        await exchangeUsdc(pool, otherAccount, USDC_CONTRACT_ADDRESS, 5);

      const tokenBalance = usdcToExchange * exchangeRate;
      const tokensToExchange = tokenBalance / 2;

      const ERC20 = await hre.ethers.getContractAt(
        "BLTM",
        await erc20.getAddress(),
        otherAccount
      );

      const approveTokenTx = await ERC20.approve(
        LiquidityPool,
        tokensToExchange
      );

      await approveTokenTx.wait();

      const exchangeTokenTx = await LiquidityPool.exchangeTokenForUsdc(
        tokensToExchange
      );

      await exchangeTokenTx.wait();

      const royaltiesFraction = 2 / 100;
      const receivedUsdc =
        (1 - royaltiesFraction) * (tokensToExchange / exchangeRate);
      const updatedUsdcBalance =
        hre.ethers.toNumber(usdcBalance) - usdcToExchange + receivedUsdc;

      expect(await USDC.balanceOf(otherAccount)).to.equal(updatedUsdcBalance);
    });

    it("Should revert if BLTM spend allowance is insufficient", async function () {
      const { pool, otherAccount } = await loadFixture(deployPoolFixture);

      const LiquidityPool = await hre.ethers.getContractAt(
        "BLTMLiquidityPool",
        await pool.getAddress(),
        otherAccount
      );

      const tokensToExchange = getUSDCValue(5);

      await expect(LiquidityPool.exchangeTokenForUsdc(tokensToExchange)).to
        .reverted;
    });
  });

  describe("Withdrawals", function () {
    it("Should withdraw the given USDC amount to the caller if it is a owner", async function () {
      const { pool, owner, otherAccount, USDC_CONTRACT_ADDRESS } =
        await loadFixture(deployPoolFixture);

      const { USDC, usdcToExchange } = await exchangeUsdc(
        pool,
        otherAccount,
        USDC_CONTRACT_ADDRESS,
        5
      );

      const currentOwnerUsdcBalance = await USDC.balanceOf(owner);

      const withdrawTx = await pool.withdrawUsdc(usdcToExchange);

      await withdrawTx.wait();

      const newOwnerUsdcBalance =
        hre.ethers.toNumber(currentOwnerUsdcBalance) + usdcToExchange;

      expect(await USDC.balanceOf(owner)).to.equal(newOwnerUsdcBalance);
    });

    it("Should revert if there is no USDC to withdraw", async function () {
      const { pool, otherAccount, USDC_CONTRACT_ADDRESS } = await loadFixture(
        deployPoolFixture
      );

      await exchangeUsdc(pool, otherAccount, USDC_CONTRACT_ADDRESS, 0);

      expect(pool.withdrawUsdc(getUSDCValue(5))).to.reverted;
    });

    it("Should prevent USDC withdrawal if the caller is not assigned OWNER_ROLE", async function () {
      const { pool, otherAccount, OWNER_ROLE, USDC_CONTRACT_ADDRESS } =
        await loadFixture(deployPoolFixture);

      expect(await pool.hasRole(OWNER_ROLE, otherAccount)).to.be.false;

      const { LiquidityPool, usdcToExchange } = await exchangeUsdc(
        pool,
        otherAccount,
        USDC_CONTRACT_ADDRESS,
        5
      );

      await expect(LiquidityPool.withdrawUsdc(usdcToExchange)).to.reverted;
    });
  });
});

async function exchangeUsdc(
  pool: contracts.bltmLiquidityPoolSol.BLTMLiquidityPool,
  account: HardhatEthersSigner,
  usdcContractAddress: string,
  usdcAmount: number
) {
  const LiquidityPool = await hre.ethers.getContractAt(
    "BLTMLiquidityPool",
    await pool.getAddress(),
    account
  );

  const USDC = new hre.ethers.Contract(usdcContractAddress, ERC20Abi, account);

  const usdcToExchange = getUSDCValue(usdcAmount);

  const usdcBalance = await USDC.balanceOf(account);

  const approveUsdcTx = await USDC.approve(LiquidityPool, usdcToExchange);

  await approveUsdcTx.wait();

  const exchangeUsdcTx = await LiquidityPool.exchangeUsdcForToken(
    usdcToExchange
  );

  await exchangeUsdcTx.wait();

  return { LiquidityPool, USDC, usdcBalance, usdcToExchange };
}

function getUSDCValue(value: number) {
  return value * 10 ** 6;
}
