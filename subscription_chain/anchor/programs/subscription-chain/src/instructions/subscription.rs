use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::error::*;

use crate::states::*;
use crate::states::SUBSCRIPTION_SEED;

pub fn _subscribe(ctx: Context<Subscribe>, typ: SubscriptionType) -> Result<()>{
    let price = ctx.accounts.config.get_price_type(typ);
    let system_program = &ctx.accounts.system_program;

    system_program::transfer(
        CpiContext::new(
            system_program.to_account_info(),
            system_program::Transfer{
                from: ctx.accounts.subscriber.to_account_info(),
                to: ctx.accounts.creator.to_account_info()
            }
        ),
        price
    )?;

    let subscription = &mut ctx.accounts.subscription;
    subscription.subscriber = ctx.accounts.subscriber.key();
    subscription.bump = ctx.bumps.subscription;

    let clock = Clock::get()?.unix_timestamp;
    subscription.end_timestamp = clock + typ.get_duration_seconds();
    subscription.typ = typ;
    subscription.paused_at = 0;

    Ok(())
}

pub fn _cancel_subscription(_ctx: Context<CancelSubscription>) -> Result<()>{
    Ok(())
}

#[derive(Accounts)]
#[instruction(typ: SubscriptionType)]
pub struct Subscribe<'info> {
    /// CHECK: Creator receives payment, validated via config
    #[account(
        mut,
        address = config.creator @ SubscriptionError::InvalidCreator
    )]
    pub creator: AccountInfo<'info>,
    #[account(
        seeds = [CONFIG_SEED.as_bytes()],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(
        init,
        payer = subscriber,
        space = 8 + Subscription::INIT_SPACE,
        seeds = [SUBSCRIPTION_SEED.as_bytes(), subscriber.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, Subscription>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(
        mut,
        has_one = subscriber,
        close = subscriber,
        seeds = [SUBSCRIPTION_SEED.as_bytes(), subscriber.key().as_ref()],
        bump = subscription.bump
    )]
    pub subscription: Account<'info, Subscription>,
}