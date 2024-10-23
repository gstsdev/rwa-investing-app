import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ignition } from "hardhat";
import BLTMTokenModule from "../ignition/modules/BLTMToken";
import { contracts } from "../typechain-types";

describe("BLTMToken", function () {
  async function deployTokenFixture() {
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

    const [DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE] = await Promise.all([
      erc20.DEFAULT_ADMIN_ROLE(),
      erc20.MINTER_ROLE(),
      erc20.PAUSER_ROLE(),
    ]);

    return {
      erc20,
      owner,
      otherAccount,
      DEFAULT_ADMIN_ROLE,
      MINTER_ROLE,
      PAUSER_ROLE,
    };
  }

  describe("Deployment", function () {
    it("Should have decimals set to 6 to match USDC", async function () {
      const { erc20 } = await loadFixture(deployTokenFixture);

      expect(await erc20.decimals(), "decimals is not equal to 6").to.equal(6);
    });

    it("Should set the right roles to the owner", async function () {
      const { erc20, owner, DEFAULT_ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE } =
        await loadFixture(deployTokenFixture);

      expect(
        await erc20.hasRole(DEFAULT_ADMIN_ROLE, owner),
        "owner is not assigned DEFAULT_ADMIN_ROLE"
      ).to.be.true;

      expect(
        await erc20.hasRole(MINTER_ROLE, owner),
        "owner is not assigned MINTER_ROLE"
      ).to.be.true;

      expect(
        await erc20.hasRole(PAUSER_ROLE, owner),
        "owner is not assigned PAUSER_ROLE"
      ).to.be.true;
    });
  });

  describe("Mintable", function () {
    it("Should mint tokens for the given account", async function () {
      const { erc20, owner } = await loadFixture(deployTokenFixture);

      await expect(erc20.mint(owner, 5)).not.to.reverted;

      expect(await erc20.balanceOf(owner)).to.equal(5);
    });

    it("Should prevent minting when caller is not assigned MINTER_ROLE", async function () {
      const { erc20, otherAccount, MINTER_ROLE } = await loadFixture(
        deployTokenFixture
      );

      expect(await erc20.hasRole(MINTER_ROLE, otherAccount)).to.be.false;

      const BLTM = await hre.ethers.getContractAt(
        "BLTM",
        await erc20.getAddress(),
        otherAccount
      );

      await expect(BLTM.mint(otherAccount, 1)).to.reverted;
    });
  });

  describe("Burnable", function () {
    it("Should allow owner to burn its own tokens", async function () {
      const { erc20, owner } = await loadFixture(deployTokenFixture);

      await erc20.mint(owner, 2);

      const tx = await erc20.burn(1);

      await tx.wait();

      expect(await erc20.balanceOf(owner)).to.equal(1);
    });

    it("Should allow owner to burn tokens from another account if approved", async function () {
      const { erc20, owner, otherAccount } = await loadFixture(
        deployTokenFixture
      );

      const mintTx = await erc20.mint(otherAccount, 3);

      await mintTx.wait();

      const ERC20 = await hre.ethers.getContractAt(
        "BLTM",
        await erc20.getAddress(),
        otherAccount
      );

      const approveTx = await ERC20.approve(owner, 1);

      await approveTx.wait();

      const tx = await erc20.burnFrom(otherAccount, 1);

      await tx.wait();

      expect(await erc20.balanceOf(otherAccount)).to.equal(2);
    });

    it("Should prevent owner to burn tokens from another account if not approved", async function () {
      const { erc20, otherAccount } = await loadFixture(deployTokenFixture);

      await erc20.mint(otherAccount, 3);

      await expect(erc20.burnFrom(otherAccount, 1)).to.reverted;
    });

    it("Should prevent burning when caller is not assigned MINTER_ROLE", async function () {
      const { erc20, otherAccount, MINTER_ROLE } = await loadFixture(
        deployTokenFixture
      );

      expect(await erc20.hasRole(MINTER_ROLE, otherAccount)).to.be.false;

      const BLTM = await hre.ethers.getContractAt(
        "BLTM",
        await erc20.getAddress(),
        otherAccount
      );

      await expect(BLTM.burn(1)).to.reverted;

      await expect(BLTM.burnFrom(otherAccount, 1)).to.reverted;
    });
  });

  describe("Pausable", function () {
    it("Should not be paused by accounts without PAUSER_ROLE", async function () {
      const { erc20, otherAccount, PAUSER_ROLE } = await loadFixture(
        deployTokenFixture
      );

      expect(await erc20.hasRole(PAUSER_ROLE, otherAccount)).to.be.false;

      const BLTM = await hre.ethers.getContractAt(
        "BLTM",
        await erc20.getAddress(),
        otherAccount
      );

      await expect(BLTM.pause()).to.reverted;
    });

    it("Should not be unpaused by accounts without PAUSER_ROLE", async function () {
      const { erc20, otherAccount, PAUSER_ROLE } = await loadFixture(
        deployTokenFixture
      );

      const tx = await erc20.pause();

      await tx.wait();

      expect(await erc20.hasRole(PAUSER_ROLE, otherAccount)).to.be.false;

      const BLTM = await hre.ethers.getContractAt(
        "BLTM",
        await erc20.getAddress(),
        otherAccount
      );

      await expect(BLTM.unpause()).to.reverted;
    });

    it("Should prevent minting when contract is paused", async function () {
      const { erc20, owner } = await loadFixture(deployTokenFixture);

      const tx = await erc20.pause();

      await tx.wait();

      expect(await erc20.paused()).to.be.true;

      await expect(erc20.mint(owner, 1)).to.revertedWithCustomError(
        erc20,
        "EnforcedPause"
      );
    });

    it("Should allow minting when contract has been unpaused", async function () {
      const { erc20, owner } = await loadFixture(deployTokenFixture);

      const tx1 = await erc20.pause();

      await tx1.wait();

      expect(await erc20.paused()).to.be.true;

      const tx2 = await erc20.unpause();

      await tx2.wait();

      expect(await erc20.paused()).to.be.false;

      await expect(erc20.mint(owner, 1)).to.not.reverted;
    });

    it("Should prevent burning when contract is paused", async function () {
      const { erc20, otherAccount } = await loadFixture(deployTokenFixture);

      const mintTx = await erc20.mint(otherAccount, 2);

      await mintTx.wait();

      const pauseTx = await erc20.pause();

      await pauseTx.wait();

      expect(await erc20.paused()).to.be.true;

      await expect(erc20.burnFrom(otherAccount, 1)).to.revertedWithCustomError(
        erc20,
        "EnforcedPause"
      );
    });

    it("Should allow burning when contract has been unpaused", async function () {
      const { erc20, owner, otherAccount } = await loadFixture(
        deployTokenFixture
      );

      const mintTx = await erc20.mint(otherAccount, 2);

      await mintTx.wait();

      const ERC20 = await hre.ethers.getContractAt(
        "BLTM",
        await erc20.getAddress(),
        otherAccount
      );

      const approveTx = await ERC20.approve(owner, 1);

      await approveTx.wait();

      const pauseTx = await erc20.pause();

      await pauseTx.wait();

      expect(await erc20.paused()).to.be.true;

      await expect(erc20.burnFrom(otherAccount, 1)).to.revertedWithCustomError(
        erc20,
        "EnforcedPause"
      );

      const unpauseTx = await erc20.unpause();

      await unpauseTx.wait();

      expect(await erc20.paused()).to.be.false;

      await expect(erc20.burnFrom(otherAccount, 1)).not.to.reverted;
    });
  });
});
