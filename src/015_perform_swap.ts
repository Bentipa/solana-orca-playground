import { getOrca, Network, OrcaPoolConfig } from "@orca-so/sdk";
import {
  Connection, Keypair
} from "@solana/web3.js";
import Decimal from "decimal.js";
import secret from "../wallet.json";


export async function swapSolWithOrca(_solAmount, callback) {
  // Initialize a connection to the RPC and read in private key
  const connection = new Connection("https://api.devnet.solana.com", "singleGossip");
  const orca = getOrca(connection, Network.DEVNET);
  const keypair = Keypair.fromSecretKey(new Uint8Array(secret));
//   console.log("endpoint:", connection.rpcEndpoint);
//   console.log("wallet pubkey:", keypair.publicKey.toBase58());

  const orcaSolPool = orca.getPool(OrcaPoolConfig.ORCA_SOL);
  const solToken = orcaSolPool.getTokenB();
  const solAmount = new Decimal(_solAmount as Decimal.Value);
  const quote = await orcaSolPool.getQuote(solToken, solAmount);
  const orcaAmount = quote.getMinOutputAmount();

  console.log(
    `Swappin ${_solAmount.toString()} SOL for at least ${orcaAmount.toNumber()} ORCA...`
  );
  const swapPayload = await orcaSolPool.swap(
    keypair,
    solToken,
    solAmount,
    orcaAmount
  );
  const swapTxId = await swapPayload.execute();
  console.log("Swapped:", swapTxId, "\n");
  callback && callback();
}
