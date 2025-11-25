use anchor_lang::prelude::*;
use crate::states::Config;
use crate::states::CONFIG_SEED;
use crate::error::SubscriptionError;

pub fn _create_creator_config(
    ctx: Context<InitCreatorConfig>,
    monthly_price: u64,
    quartal_price: u64,
    annual_price: u64
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.creator = ctx.accounts.creator.key();
    config.month_price = monthly_price;
    config.quartal_price = quartal_price;
    config.annual_price = annual_price;
    config.bump = ctx.bumps.config;

    Ok(())
}

pub fn _update_creator_price(
    ctx: Context<UpdateCreatorPrice>,
    monthly_price: Option<u64>,
    quartal_price: Option<u64>,
    annual_price: Option<u64>
) -> Result<()>{
    let config = &mut ctx.accounts.config;
    if let Some(price) = monthly_price {
        require!(price > 0, SubscriptionError::PriceTooLow);
        config.month_price = price
    }

    if let Some(price) = quartal_price {
        require!(price > 0, SubscriptionError::PriceTooLow);
        config.quartal_price = price;
    }

    if let Some(price) = annual_price {
        require!(price > 0, SubscriptionError::PriceTooLow);
        config.annual_price = price;
    }

    Ok(())
}

#[derive(Accounts)]
#[instruction(monthly_price: u64, quartal_price: u64, annual_price: u64)]
pub struct InitCreatorConfig<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        constraint = monthly_price > 0 @ SubscriptionError::PriceTooLow,
        constraint = quartal_price > 0 @ SubscriptionError::PriceTooLow,
        constraint = annual_price > 0 @ SubscriptionError::PriceTooLow,
        space = 8 + Config::INIT_SPACE,
        seeds = [CONFIG_SEED.as_bytes()],
        bump
    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct UpdateCreatorPrice<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        mut,
        has_one = creator,
        seeds = [CONFIG_SEED.as_bytes()],
        bump = config.bump
    )]
    pub config: Account<'info, Config>
}