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

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_config(month_price: u64, quartal_price: u64, annual_price: u64) -> Config {
        Config {
            creator: Pubkey::default(),
            month_price,
            quartal_price,
            annual_price,
            bump: 0,
        }
    }

    #[test]
    fn test_get_price_type_month() {
        let config = create_test_config(100, 250, 900);
        assert_eq!(config.get_price_type(SubscriptionType::Month), 100);
    }

    #[test]
    fn test_get_price_type_quartal() {
        let config = create_test_config(100, 250, 900);
        assert_eq!(config.get_price_type(SubscriptionType::Quartal), 250);
    }

    #[test]
    fn test_get_price_type_annual() {
        let config = create_test_config(100, 250, 900);
        assert_eq!(config.get_price_type(SubscriptionType::Annual), 900);
    }

    #[test]
    fn test_get_price_type_with_different_prices() {
        let config = create_test_config(10_000_000, 25_000_000, 90_000_000);
        
        assert_eq!(config.get_price_type(SubscriptionType::Month), 10_000_000);
        assert_eq!(config.get_price_type(SubscriptionType::Quartal), 25_000_000);
        assert_eq!(config.get_price_type(SubscriptionType::Annual), 90_000_000);
    }

    #[test]
    fn test_config_seed_constant() {
        assert_eq!(CONFIG_SEED, "config");
    }
}