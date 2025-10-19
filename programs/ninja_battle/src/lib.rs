use anchor_lang::prelude::*;


pub token_program: Program<'info, Token>;
}


#[derive(Accounts)]
pub struct FreezeAndSnapshot<'info> {
#[account(mut)]
pub battle: Account<'info, BattleState>;
/// CHECK: allowed oracle signer
pub oracle_signer: UncheckedAccount<'info>;
}


#[derive(Accounts)]
pub struct ResolveBattle<'info> {
#[account(mut)]
pub battle: Account<'info, BattleState>;
}


#[derive(Accounts)]
pub struct AuthorizePayout<'info> {
#[account(mut)]
pub battle: Account<'info, BattleState>;


/// CHECK: PDA authority of vaults
pub vault_authority: UncheckedAccount<'info>;


#[account(mut)]
pub vault_a: Account<'info, TokenAccount>;
#[account(mut)]
pub vault_b: Account<'info, TokenAccount>;


/// CHECK: off-chain relayer authority that controls payout escrows
pub payout_authority: UncheckedAccount<'info>;


// Escrows owned by payout authority (off-chain relayer signs swaps and payouts)
#[account(mut)]
pub payout_escrow_a: Account<'info, TokenAccount>;
#[account(mut)]
pub payout_escrow_b: Account<'info, TokenAccount>;


pub token_program: Program<'info, Token>;
}


#[account]
pub struct BattleState {
pub creator: Pubkey,
pub team_a_mint: Pubkey,
pub team_b_mint: Pubkey,
pub starts_at: i64,
pub ends_at: i64,
pub status: u8,
pub team_a_total: u64,
pub team_b_total: u64,
pub px_a_e6: u64, // snapshot USD price (6 decimals)
pub px_b_e6: u64,
pub winner_side: u8,
pub oracle_signer: Pubkey,
}


impl BattleState { pub const SIZE: usize = 32+32+32+8+8+1+8+8+8+8+1+32; }


#[event]
pub struct StakeLocked { pub battle: Pubkey, pub side: u8, pub staker: Pubkey, pub amount: u64 }
#[event]
pub struct SnapshotTaken { pub battle: Pubkey, pub px_a_e6: u64, pub px_b_e6: u64 }
#[event]
pub struct BattleResolved { pub battle: Pubkey, pub winner_side: u8 }
#[event]
pub struct PayoutAuthorized { pub battle: Pubkey, pub payout_authority: Pubkey }


#[error_code]
pub enum BattleError {
#[msg("Invalid timing")] InvalidTiming,
#[msg("Battle not started")] NotStarted,
#[msg("Battle ended")] Ended,
#[msg("Wrong status for this action")] WrongStatus,
#[msg("Invalid side")] InvalidSide,
#[msg("Wrong mint for chosen side")] WrongMintForSide,
#[msg("Math overflow")] MathOverflow,
#[msg("Not ended yet")] NotEnded,
#[msg("Unauthorized")] Unauthorized,
}


fn clock_unix() -> i64 { Clock::get().unwrap().unix_timestamp }


#[repr(u8)]
pub enum BattleStatus { Warmup = 1, Locked = 2, Live = 3, Resolved = 4 }
