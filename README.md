# [Gustavo S. T. Sampaio] Basic dApp for RWA Investing

This is a monorepo containing the Solidity smart contracts and the Next.js project for the RWA Investing dApp.

In this app, you can exchange ("Deposit") USDC for BLTM (the app token) and exchange BLTM for USDC ("Withdraw"). You can also see your BLTM balance.

## Tech Stack

- Contracts
  * Hardhat
  * OpenZeppelin Contracts
  * OpenZeppelin Wizard (for generating boilerplates)
- Web App
  * Next.js
  * TailwindCSS
  * `geist` font
  * Reown's AppKit (former WalletConnect)
  * Wagmi
  * Viem (typed alternative to Ethers.js)
  * TanStack React Query
  * Lucide React (Icons)

## Setup

- Prerequisites:
  * Node.js 18.x

From the root folder of the project:

1. Run `npm install`
2. Set Hardhat Config Variables:
```shell
# private key of a wallet used to deploy the contracts
npx -w contract hardhat vars set ACCOUNT_PRIVATE_KEY <...>

# Optional. Some options are available at https://chainlist.org/chain/80002. Can also be set to the Alchemy RPC Node
npx -w contract hardhat vars set POLYGON_AMOY_RPC <...>

# Can be obtained at https://www.alchemy.com/
npx -w contract hardhat vars set ALCHEMY_API_KEY <...>

# Can be obtained at https://www.oklink.com/account/my-api
npx -w contract hardhat vars set OKLINK_AMOY_API_KEY <...>
```
3. Spin up Hardhat Node:
```shell
npx -w contract hardhat node
```
4. Add `.env` file in the `web/` folder, following the `.env.sample`
    - Create an AppKit project at https://cloud.reown.com/app
    - Get the contract addresses at `contract/ignition/deployments/chain-80002/deployed_addresses.json` and place them as follows:
      * Address at `BLTMToken#BLTM` goes after `NEXT_PUBLIC_BLTM_CONTRACT_ADDRESS=`
      * Address at `BLTMLiquidityPool#BLTMLiquidityPool` goes after `NEXT_PUBLIC_BLTM_POOL_CONTRACT_ADDRESS=`
5. Run `npm -w web run dev`
6. Go to http://localhost:3000 and that's it!

## Approach

Since I thought I could use the smart contract from the web application, I decided to use a monorepo structure, where each project lives in its own folder.

I started with the smart contracts, following the order of the document and knowing that it is one of the core components of the project, along with their test cases, trying to cover, as much as possible, most of the edge cases from our side. For the ERC-20 contract, I used the OpenZeppelin Wizard, along with their `@openzeppelin/contracts` library, so I wouldn't have to worry about implementing all the ERC-20 logic from scratch.

After that, I developed the Next.js project, using Reown's AppKit (former WalletConnect AppKit) as the Wallet UI library and Wagmi for interactions with the contracts.

For both projects, I tried to following a sequence of steps, which made it easier to keep track of the progress.

## Challenges

I must confess that the smart contracts side of the project was the most challenging, since I hadn't dealt with this for a long time. Some aspects of it were also kind of new to me.

The web app side was relatively easier, but setting up Reown's AppKit was also a bit challenging. Halfway through the process, I faced a bug with Next.js 15, which, after a few tries, led me to downgrade it to version 14, which fixed the bug.

## Possible Improvements

- I think that if we were able to embed the approve process in the `BLTMLiquidityPool#exchangeUsdcForToken()` and `BLTMLiquidityPool#exchangeTokenForUsdc()` methods, the deposit/withdraw flow could be more fluid (instead of being a 2-step process, it would be a single step).
- The smart contract addresses, as well as the ABIs, could be automatically inserted in the web app code through some code generation process, so we don't have to worry about updating them in the code, or in the environment variables, manually.
- We could improve the integration of smart contracts with types. Tools like Viem seem to help with that. I ended up not implementing it, since it would require to re-write all the test cases.

## TODOs


- [ ] "Transactions History" table
- [ ] Unit tests for the web app
