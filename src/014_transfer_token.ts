import { DecimalUtil, deriveATA, resolveOrCreateATA } from "@orca-so/common-sdk";
import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const COMMITMENT = 'confirmed';

export async function transferTokenToPublicKey(src: Keypair, dest_pubkey: PublicKey, amount: number) {
  // Initialize a connection to the RPC and read in private key
  const connection = new Connection(RPC_ENDPOINT_URL, COMMITMENT);
  console.log("⚙️  endpoint:", connection.rpcEndpoint);
  console.log("⚙️  wallet pubkey:", src.publicKey.toBase58());

  // ORCA DEV
  const DEV_ORCA_MINT = new PublicKey("CYmybCs3VNKwhzdVogXKWdFyjVBTwd4N3kteY95tCr6F");
  const DEV_ORCA_DECIMALS = 18;

  // Obtain the associated token account from the source wallet
  const src_token_account = await deriveATA(src.publicKey, DEV_ORCA_MINT);

  // Obtain the associated token account for the destination wallet.
  const {address: dest_token_account, ...create_ata_ix} = await resolveOrCreateATA(
    connection,
    dest_pubkey,
    DEV_ORCA_MINT,
    ()=>connection.getMinimumBalanceForRentExemption(AccountLayout.span),
    DecimalUtil.toU64(DecimalUtil.fromNumber(0)),
    src.publicKey
  );

  // Create the instruction to send devSAMO
  const transfer_ix = Token.createTransferCheckedInstruction(
    TOKEN_PROGRAM_ID,
    src_token_account,
    DEV_ORCA_MINT,
    dest_token_account,
    src.publicKey,
    [],
    amount,
    DEV_ORCA_DECIMALS
  );

  // Create the transaction and add the instruction
  const tx = new Transaction();
  // Create the destination associated token account (if needed)
  create_ata_ix.instructions.map((ix) => tx.add(ix));
  // Send orca dev
  tx.add(transfer_ix);

  // Send the transaction
  const signers = [src];
  const signature = await connection.sendTransaction(tx, signers);
  console.log("⚙️  signature:", signature);

  // Wait for the transaction to be confirmed
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature
  });
}

