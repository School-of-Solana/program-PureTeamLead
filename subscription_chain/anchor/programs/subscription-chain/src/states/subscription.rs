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
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_month_duration_seconds() {
        let subscription_type = SubscriptionType::Month;
        let expected = 30 * 24 * 60 * 60; // 30 days in seconds
        assert_eq!(subscription_type.get_duration_seconds(), expected);
    }

    #[test]
    fn test_quartal_duration_seconds() {
        let subscription_type = SubscriptionType::Quartal;
        let expected = 90 * 24 * 60 * 60; // 90 days in seconds
        assert_eq!(subscription_type.get_duration_seconds(), expected);
    }

    #[test]
    fn test_annual_duration_seconds() {
        let subscription_type = SubscriptionType::Annual;
        let expected = 365 * 24 * 60 * 60; // 365 days in seconds
        assert_eq!(subscription_type.get_duration_seconds(), expected);
    }

    #[test]
    fn test_duration_ordering() {
        // Verify that durations are ordered correctly: Month < Quartal < Annual
        let month = SubscriptionType::Month.get_duration_seconds();
        let quartal = SubscriptionType::Quartal.get_duration_seconds();
        let annual = SubscriptionType::Annual.get_duration_seconds();
        
        assert!(month < quartal);
        assert!(quartal < annual);
    }

    #[test]
    fn test_subscription_type_equality() {
        assert_eq!(SubscriptionType::Month, SubscriptionType::Month);
        assert_eq!(SubscriptionType::Quartal, SubscriptionType::Quartal);
        assert_eq!(SubscriptionType::Annual, SubscriptionType::Annual);
        assert_ne!(SubscriptionType::Month, SubscriptionType::Quartal);
        assert_ne!(SubscriptionType::Quartal, SubscriptionType::Annual);
    }
}