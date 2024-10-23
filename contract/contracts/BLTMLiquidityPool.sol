// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface Mintable {
    function mint(address to, uint256 amount) external;
}

interface Burnable {
    function burn(uint256 value) external;

    function burnFrom(address account, uint256 value) external;
}

contract BLTMLiquidityPool is Context, AccessControl {
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    uint256 internal constant _royaltyFractionNumerator = 2;
    uint256 internal constant _royaltyFractionDenominator = 100;

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
        require(
            exchangeRate_ > 0,
            "Exchange rate cannot be less or equal to 0"
        );

        exchangeRate = exchangeRate_;
    }

    function exchangeUsdcForToken(uint256 value) public {
        require(
            USDC.allowance(_msgSender(), address(this)) >= value,
            "USDC allowance too low"
        );

        _safeTransferFrom(USDC, _msgSender(), address(this), value);

        uint256 tokenAmount = value * exchangeRate;

        Mintable(address(BLTM)).mint(_msgSender(), tokenAmount);
    }

    function exchangeTokenForUsdc(uint256 value) public {
        uint256 usdcAmount = value / exchangeRate;
        uint256 exchangeableUsdcAmount = (usdcAmount *
            (100 - _royaltyFractionNumerator)) / _royaltyFractionDenominator;

        Burnable(address(BLTM)).burnFrom(_msgSender(), value);

        _safeTransfer(USDC, _msgSender(), exchangeableUsdcAmount);
    }

    function _safeTransferFrom(
        IERC20 token,
        address sender,
        address recipient,
        uint256 amount
    ) private {
        bool sent = token.transferFrom(sender, recipient, amount);

        require(sent, "Token transfer failed");
    }

    function _safeTransfer(
        IERC20 token,
        address recipient,
        uint256 amount
    ) private {
        bool sent = token.transfer(recipient, amount);

        require(sent, "Token transfer failed");
    }
}
