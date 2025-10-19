// apps/api/src/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient, BattleStatus } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import idl from '../../programs/target/idl/ninja_battle.json';


const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());


const RPC_SOLANA = process.env.RPC_SOLANA!;
const PROGRAM_ID = new PublicKey((idl as any).metadata.address);


function providerFromKeypair(connection: Connection) {
// For server-side tx (e.g., create battle) we can use a hot wallet or forward to client.
// MVP: assume front-end creates on-chain battle; API stores metadata.
return { connection } as any;
}


app.post('/battles', async (req, res) => {
const { chain = 'solana', teamAMint, teamBMint, startsAt, endsAt, creatorTgid } = req.body;
const chainRow = await prisma.chain.findFirst({ where: { name: 'solana' } });
if (!chainRow) return res.status(400).json({ error: 'Chain not seeded' });


// Persist off-chain record; on-chain creation happens in client or script.
const battle = await prisma.battle.create({ data: {
chainId: chainRow.id,
creatorTgid,
status: 'WARMUP',
startsAt: startsAt ? new Date(startsAt) : null,
endsAt: endsAt ? new Date(endsAt) : null,
teamATokenId: (await prisma.token.findFirstOrThrow({ where: { address: teamAMint } })).id,
teamBTokenId: (await prisma.token.findFirstOrThrow({ where: { address: teamBMint } })).id,
}});


const shareUrl = `${process.env.PUBLIC_BASE_URL}/b/${battle.id}`;
res.json({ battleId: battle.id, shareUrl });
});


app.get('/battles/:id', async (req, res) => {
const battle = await prisma.battle.findUnique({ where: { id: req.params.id }, include: { snapshot: true, teamAToken: true, teamBToken: true } });
if (!battle) return res.status(404).json({ error: 'not found' });
res.json(battle);
});


app.post('/battles/:id/stake', async (req, res) => {
const { side, amountRaw, wallet, tokenAddress } = req.body;
const battle = await prisma.battle.findUnique({ where: { id: req.params.id } });
if (!battle) return res.status(404).json({ error: 'not found' });
const token = await prisma.token.findFirst({ where: { address: tokenAddress } });
if (!token) return res.status(400).json({ error: 'token not allowed' });


const stake = await prisma.stake.create({ data: { battleId: battle.id, side, wallet, tokenId: token.id, amountRaw } });
res.json(stake);
});


app.post('/internal/battles/:id/snapshot', async (req, res) => {
const { pxAUsd, pxBUsd, source } = req.body;
const battle = await prisma.battle.update({ where: { id: req.params.id }, data: { status: 'LIVE' } });
const snap = await prisma.priceSnapshot.create({ data: { battleId: battle.id, takenAt: new Date(), teamAPriceUsd: pxAUsd, teamBPriceUsd: pxBUsd, source } });
res.json(snap);
});


app.post('/internal/battles/:id/resolve', async (req, res) => {
const { winnerSide } = req.body;
const battle = await prisma.battle.update({ where: { id: req.params.id }, data: { status: 'RESOLVED', winnerSide } });
res.json(battle);
});


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));
