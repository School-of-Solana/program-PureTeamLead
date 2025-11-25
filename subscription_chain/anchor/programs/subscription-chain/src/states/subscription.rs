use anchor_lang::prelude::*;

pub const SUBSCRIPTION_SEED: &str = "SUBSCRIPTION_SEED";

#[account]
#[derive(InitSpace)]
pub struct Subscription {
    pub subscriber: Pubkey,
    pub paused_at: i64, // also timestamp
    pub typ: SubscriptionType,
    pub end_timestamp: i64,
    pub bump: u8,
}

#[derive(InitSpace)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum SubscriptionType {
    Month,
    Quartal,
    Annual,
}

impl SubscriptionType {
    pub fn get_duration_seconds(&self) -> i64 {
        match self {
            SubscriptionType::Month => 30 * 24 * 60 * 60,
            SubscriptionType::Quartal => 90 * 24 * 60 * 60,
            SubscriptionType::Annual => 365 * 24 * 60 * 60,
        }
    }
}