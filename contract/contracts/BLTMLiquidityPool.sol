// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BLTMLiquidityPool is Context, AccessControl {
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    IERC20 private BLTM;
    IERC20 private USDC;
    uint256 private exchangeRate;

    constructor(
        address erc20TokenAddress_,
        address usdcTokenAddress_,
        uint256 exchangeRate_
    ) {
        _grantRole(OWNER_ROLE, _msgSender());

        BLTM = IERC20(erc20TokenAddress_);
        USDC = IERC20(usdcTokenAddress_);

        updateExchangeRate(exchangeRate_);
    }

    function updateExchangeRate(
        uint256 exchangeRate_
    ) public onlyRole(OWNER_ROLE) {
        exchangeRate = exchangeRate_;
    }
}
