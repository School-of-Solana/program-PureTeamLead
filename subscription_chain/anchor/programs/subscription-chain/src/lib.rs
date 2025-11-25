use crate::instructions::*;
use crate::states::*;
use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod states;

declare_id!("8ZHxyWD1BV6qjBx3nk7DQJMuphC8GJpbRqaX85qC79AD");

// TODO: unit tests

#[program]
pub mod subscription_chain {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn create_creator_profile(ctx: Context<InitCreatorConfig>, monthly_price:u64, quartal_price:u64, annual_price:u64) -> Result<()> {
        _create_creator_config(ctx, monthly_price, quartal_price, annual_price)
    }

    pub fn subscription(ctx: Context<Subscribe>, typ: SubscriptionType) -> Result<()> {
        _subscribe(ctx, typ)
    }

    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()>{
        _cancel_subscription(ctx)
    }

    pub fn pause_subscription(ctx: Context<PauseSubscription>) -> Result<()>{
         _pause_subscription(ctx)
    }

    pub fn resume_subscription(ctx: Context<ResumeSubscription>) -> Result<()>{
        _resume_subscription(ctx)
    }

    pub fn update_creator_price(ctx: Context<UpdateCreatorPrice>, monthly_price:Option<u64>, quartal_price:Option<u64>, annual_price:Option<u64>) -> Result<()>{
        _update_creator_price(ctx, monthly_price, quartal_price, annual_price)
    }

    pub fn extend_subscription(ctx: Context<ExtendSubscription>, typ: SubscriptionType) -> Result<()>{
        _extend_subscription(ctx, typ)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
