// apps/webapp/src/solana.ts
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';


export async function prepareLockStakeTx({ connection, battlePda, staker, side, amountRaw, stakeFromAta, vaultAta, programId }:{
connection: Connection;
battlePda: string;
staker: PublicKey;
side: 1|2;
amountRaw: bigint;
stakeFromAta: string;
vaultAta: string;
programId: string;
}){
// In MVP we call the API to get a prebuilt instruction; here we stub a tx container
const tx = new Transaction();
// TODO: add Anchor instruction via idl + coder
tx.add(SystemProgram.nop());
tx.feePayer = staker;
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
return tx;
}
