// apps/relayer/src/index.ts
import 'dotenv/config';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import fetch from 'node-fetch';


const RPC = process.env.RPC_SOLANA!;
const JUP = 'https://quote-api.jup.ag/v6';
const RELAYER = Keypair.fromSecretKey(Buffer.from(JSON.parse(process.env.RELAYER_KEYPAIR!)));
const TREASURY = new PublicKey(process.env.TREASURY!);
const FEE_BPS = Number(process.env.FEE_BPS ?? 300);


async function quoteAndSwap({ fromMint, toMint, amount }: { fromMint: string; toMint: string; amount: string; }) {
const q = await fetch(`${JUP}/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${amount}&slippageBps=100`).then(r => r.json());
// MVP: log route; real impl would create/submit swap tx using Jupiter v6 swap API.
console.log('Route', q.routes?.[0]?.marketInfos?.map((m:any)=>m.label));
}


async function main() {
const connection = new Connection(RPC, 'confirmed');
console.log('Relayer up on', RPC, 'as', RELAYER.publicKey.toBase58());
// TODO: subscribe to program events -> on PayoutAuthorized => perform swap+distribution
}


main();
