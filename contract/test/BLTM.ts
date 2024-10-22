import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("BLTM", function () {
  async function deployTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, otherAccount2] = await hre.ethers.getSigners();

    const BLTM = await hre.ethers.getContractFactory("BLTM");
    const erc20 = await BLTM.deploy(owner, owner, owner);

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

});
