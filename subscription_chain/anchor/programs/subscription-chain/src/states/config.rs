use anchor_lang::prelude::*;
use crate::states::SubscriptionType;

pub const CONFIG_SEED: &str = "config";

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub creator: Pubkey,
    pub month_price: u64,
    pub quartal_price: u64,
    pub annual_price: u64,
    pub bump: u8,
}

impl Config {
    pub fn get_price_type(&self, typ: SubscriptionType) -> u64 {
        match typ {
            SubscriptionType::Month => self.month_price,
            SubscriptionType::Quartal => self.quartal_price,
            SubscriptionType::Annual => self.annual_price,
        }
    }
}