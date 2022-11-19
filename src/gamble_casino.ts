import { transferTokenToPublicKey } from "./014_transfer_token";
import { Keypair, Connection, PublicKey, Transaction } from "@solana/web3.js";

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

let targetPublicKey = ""; // 8xHCwmK7cvDYJZ8vRqVSC2pFnNET7PEn5tifDQKhQKWD

function printGreeting() {
  console.log("##########################");
  console.log("## Hello Stranger!      ##");
  console.log("##########################");
  console.log("");
  console.log(
    "Welcome to the Gamble Casino, where you need to guess a number and can win cool Tokens."
  );
  console.log();
}

function askForPrivateKey() {
  console.log("Firstly, we need your public key to send funds to you:");
  readline.question("publicKey(base58):", (public_base58) => {
    try {
      new PublicKey(public_base58);
    } catch (e) {
      console.log("This is not a valid public key :/ Please try again...");
      askForPrivateKey();
      return;
    }
    targetPublicKey = public_base58;
    console.log("Thank you very much!");
    startGame();
  });
}

function startGame() {
  console.log(
    "So let's start, each round you need to guess a number between 0 and 10 (incl.), if you guess correctly, you get some tokens."
  );
  console.log("To stop the game, type in (c)ancel.");
  playRound();
}

function playRound() {
  let number = Math.round(1 + (10 * Math.random() - 1));  
  readline.question("Your guess: ", (guess) => {
    if (guess == "c" || guess == "cancel") {
      console.log("Game ended, hope to so you soon!");
    } else {
      if (parseInt(guess) == number) {
        console.log("🎉 Yeye! You are correct! 🎉");
        console.log("⚙️  Sending you 1 devSAMO...");
        // Transfer token
        transferTokenToPublicKey(targetPublicKey).then(() => {
          console.log("Let's play another round!");
          playRound();
        });
      } else {
        console.log(`😔 Sadly, this is the wrong number, it was ${number} 😔`);
        console.log("Let's play another round!");
        playRound();
      }
    }
  });
}

// Program Run
printGreeting();
askForPrivateKey();
