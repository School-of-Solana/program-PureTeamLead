# Project Description

**Deployed Frontend URL:** https://program-solana-pureteamlead.vercel.app

**Solana Program ID:** 8ZHxyWD1BV6qjBx3nk7DQJMuphC8GJpbRqaX85qC79AD

## Project Overview

### Description
Subscription Chain is a decentralized subscription management platform built on Solana. It enables creators to set up subscription-based services with flexible pricing tiers (monthly, quarterly, and annual), while subscribers can manage their subscriptions entirely on-chain. The platform leverages Solana's fast transaction speeds and low fees to provide a seamless subscription experience with features like pause/resume functionality, subscription extensions, and transparent payment tracking on the blockchain.

### Key Features
- **Creator Profile Setup**: Creators can initialize their subscription service with customizable pricing for monthly, quarterly, and annual plans
- **Flexible Subscription Plans**: Users can choose between Monthly (30 days), Quarterly (90 days), or Annual (365 days) subscription tiers
- **Subscription Management**: Subscribers can pause, resume, and cancel their subscriptions at any time
- **Subscription Extension**: Active subscribers can extend their subscription by adding additional time periods
- **Price Updates**: Creators can update their subscription prices dynamically
- **On-chain Transparency**: All subscription data and payments are recorded on the Solana blockchain
  
### How to Use the dApp
1. **Connect Wallet** - Connect your Solana wallet (Phantom, Solflare, etc.) to the application
2. **Admin Setup (First User)** - If no creator profile exists, the first user can initialize the subscription service by setting monthly, quarterly, and annual prices in lamports
3. **Subscribe** - Choose your preferred subscription plan (Monthly, Quarterly, or Annual) and click "Subscribe Now" to pay and activate your subscription
4. **Manage Subscription** - Navigate to the "Manage" tab to view your subscription status, pause/resume your subscription, or cancel it
5. **Pause/Resume** - Pausing stops the subscription timer; resuming adds the paused duration back to your end date
6. **Cancel** - Cancel your subscription to close the account and receive rent back

## Program Architecture
The Subscription Chain program uses a modular architecture with separate instruction handlers for creator management, subscription operations, and subscription lifecycle management. The program maintains two main account types: a global Config account for creator settings and individual Subscription accounts for each subscriber.

### PDA Usage
The program uses Program Derived Addresses to create deterministic account addresses that ensure data isolation and prevent conflicts.

**PDAs Used:**
- **Config PDA**: Derived from seeds `["config"]` - stores the creator's public key and subscription pricing. This is a singleton account that holds the global configuration for the subscription service.
- **Subscription PDA**: Derived from seeds `["SUBSCRIPTION_SEED", subscriber_pubkey]` - ensures each subscriber has a unique subscription account tied to their wallet address.

### Program Instructions
**Instructions Implemented:**
- **create_creator_profile**: Initializes the Config account with creator's address and subscription prices (monthly, quarterly, annual)
- **subscription**: Creates a new subscription for a user, transferring the appropriate payment to the creator and setting the end timestamp
- **cancel_subscription**: Closes the subscription account and returns rent to the subscriber
- **pause_subscription**: Pauses an active subscription by recording the pause timestamp
- **resume_subscription**: Resumes a paused subscription, extending the end timestamp by the paused duration
- **update_creator_price**: Allows the creator to update subscription prices
- **extend_subscription**: Extends an existing subscription by adding more time and transferring additional payment

### Account Structure
```rust
#[account]
pub struct Config {
    pub creator: Pubkey,       // The creator's wallet address who receives payments
    pub month_price: u64,      // Price for monthly subscription in lamports
    pub quartal_price: u64,    // Price for quarterly subscription in lamports
    pub annual_price: u64,     // Price for annual subscription in lamports
    pub bump: u8,              // PDA bump seed
}

#[account]
pub struct Subscription {
    pub subscriber: Pubkey,    // The subscriber's wallet address
    pub paused_at: i64,        // Unix timestamp when subscription was paused (0 if not paused)
    pub typ: SubscriptionType, // Type of subscription (Month, Quartal, or Annual)
    pub end_timestamp: i64,    // Unix timestamp when subscription expires
    pub bump: u8,              // PDA bump seed
}

pub enum SubscriptionType {
    Month,   // 30 days
    Quartal, // 90 days
    Annual,  // 365 days
}
```

## Testing

### Test Coverage
Comprehensive test suite covering creator profile management, subscription lifecycle, and error handling scenarios.

**Happy Path Tests:**
- **Initialize**: Successfully initializes the program
- **Successful config initialization**: Creates a creator profile with valid prices
- **Successful update price**: Updates subscription prices for the creator
- **Successful subscription initialization**: Creates a new monthly subscription with correct end timestamp
- **Successful cancelling of subscription**: Cancels and closes the subscription account
- **Successful extending of subscription**: Extends an existing subscription with additional time

**Unhappy Path Tests:**
- **Invalid price config initialization**: Fails when attempting to set a price to 0 during config creation
- **Unsuccessful update price - invalid price**: Fails when trying to update price to 0
- **Invalid extending of subscription - no subscription**: Fails when trying to extend a non-existent subscription

### Running Tests
```bash
cd subscription_chain/anchor
yarn install    # install dependencies
anchor test     # run tests
```

### Additional Notes for Evaluators

This project implements a full subscription management system on Solana. Key highlights:

- **Security**: All subscription operations validate ownership using `has_one` constraints and PDA derivations
- **Payment Flow**: Payments are transferred directly from subscriber to creator using CPI calls to the System Program
- **Pause/Resume Logic**: When paused, the `paused_at` timestamp is recorded. On resume, the time difference is added to `end_timestamp`, effectively extending the subscription by the paused duration
- **Frontend**: Built with React, Vite, and TailwindCSS, featuring wallet adapter integration and responsive design
- **Error Handling**: Custom error codes for various failure scenarios (PriceTooLow, ExpiredSubscription, AlreadyPausedSubscription, etc.)