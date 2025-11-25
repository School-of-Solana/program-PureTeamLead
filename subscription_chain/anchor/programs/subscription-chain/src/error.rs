use anchor_lang::error_code;

#[error_code]
pub enum SubscriptionError {
    #[msg("Price is too low")]
    PriceTooLow,
    #[msg("Config already initialized")]
    ConfigAlreadyInitialized,
    #[msg("Subscription paused")]
    PausedSubscription,
    #[msg("Subscription already paused")]
    AlreadyPausedSubscription,
    #[msg("Subscription expired")]
    ExpiredSubscription,
    #[msg("Subscription is not paused")]
    NotPausedSubscription,
    #[msg("Invalid creator")]
    InvalidCreator
}