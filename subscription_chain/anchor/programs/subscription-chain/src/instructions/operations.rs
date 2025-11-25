use anchor_lang::prelude::*;
use crate::states::{Config, Subscription, SubscriptionType};
use crate::states::SUBSCRIPTION_SEED;
use crate::states::CONFIG_SEED;
use crate::error::*;

pub fn _pause_subscription(ctx: Context<PauseSubscription>) -> Result<()>{
    let subscription = &mut ctx.accounts.subscription;

    let clock = Clock::get()?.unix_timestamp;
    require!(subscription.end_timestamp > clock, SubscriptionError::ExpiredSubscription);
    subscription.paused_at = clock;

    Ok(())
}

pub fn _resume_subscription(ctx: Context<ResumeSubscription>) -> Result<()> {
    let subscription = &mut ctx.accounts.subscription;
    let time_diff = Clock::get()?.unix_timestamp - subscription.paused_at;
    subscription.end_timestamp += time_diff;

    Ok(())
}

pub fn _extend_subscription(ctx: Context<ExtendSubscription>, typ: SubscriptionType) -> Result<()>{
    let price = ctx.accounts.config.get_price_type(typ);
    let system_program = &ctx.accounts.system_program;
    let subscription = &mut ctx.accounts.subscription;
    require!(subscription.end_timestamp > Clock::get()?.unix_timestamp, SubscriptionError::ExpiredSubscription);

    anchor_lang::system_program::transfer(
        CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer{
                from: ctx.accounts.subscriber.to_account_info(),
                to: ctx.accounts.creator.to_account_info()
            }
        ),
        price
    )?;

    subscription.typ = typ;
    subscription.end_timestamp += typ.get_duration_seconds();

    Ok(())
}

#[derive(Accounts)]
pub struct PauseSubscription<'info> {
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(
        mut,
        has_one = subscriber,
        constraint = subscription.paused_at == 0 @ SubscriptionError::AlreadyPausedSubscription,
        seeds = [SUBSCRIPTION_SEED.as_bytes(), subscriber.key().as_ref()],
        bump = subscription.bump
    )]
    pub subscription: Account<'info, Subscription>,
}

#[derive(Accounts)]
pub struct ResumeSubscription<'info> {
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(
        mut,
        has_one = subscriber,
        constraint = subscription.paused_at > 0 @ SubscriptionError::NotPausedSubscription,
        seeds = [SUBSCRIPTION_SEED.as_bytes(), subscriber.key().as_ref()],
        bump = subscription.bump
    )]
    pub subscription: Account<'info, Subscription>,
}

#[derive(Accounts)]
pub struct ExtendSubscription<'info> {
    /// CHECK: Creator receives payment, validated via config
    #[account(
        mut,
        address = config.creator @ SubscriptionError::InvalidCreator
    )]
    pub creator: AccountInfo<'info>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(
        mut,
        has_one = subscriber,
        seeds = [SUBSCRIPTION_SEED.as_bytes(), subscriber.key().as_ref()],
        bump = subscription.bump
    )]
    pub subscription: Account<'info, Subscription>,
    #[account(
        seeds = [CONFIG_SEED.as_bytes()],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>
}