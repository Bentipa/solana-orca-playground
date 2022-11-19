import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import casinoSecret from "../wallet.json";
import { transferTokenToPublicKey } from "./014_transfer_token";
import { swapSolWithOrca } from "./015_perform_swap";

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const casinoKeypair = Keypair.fromSecretKey(Uint8Array.from(casinoSecret));

let customerKeyPair: Keypair;

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

function askForPublicKey() {
  console.log("Firstly, we need your key-pair.");
  readline.question("Path to your wallet.json: ", (path) => {
    try {
      const content = JSON.parse(fs.readFileSync(path).toString());
      customerKeyPair = Keypair.fromSecretKey(new Uint8Array(content));
    } catch (e) {
      console.log(
        "This is not a valid key pair (" + e.msg + ") :/ Please try again..."
      );
      askForPublicKey();
      return;
    }
    console.log("Thank you very much!");
    startGame();
  });
}

function startGame() {
  console.log(
    "So let's start, each round you need to guess a number between 0 and 10 (incl.), if you guess correctly, you get some tokens."
  );
  console.log("To stop the game, type in (c)ancel.");
  console.log("To get some ORCA tokens to play, type in (e)exchange.");
  playRound();
}

function playRound() {
  let number = Math.round(1 + (10 * Math.random() - 1));
  readline.question("Your guess: ", (guess) => {
    if (guess == "c" || guess == "cancel") {
      console.log("Game ended, hope to so you soon!");
    } else if (guess == "e" || guess == "exchange") {
      launchExchange();
      return;
    } else {
      if (parseInt(guess) == number) {
        console.log("🎉 Yeye! You are correct! 🎉");
        console.log("⚙️  Sending you 1 ORCA Dev...");
        // Transfer token
        transferTokenToPublicKey(
          casinoKeypair,
          customerKeyPair.publicKey,
          1
        ).then(() => {
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

function launchExchange() {
  readline.question(
    "Type in the amount of sol to buy ORCA for, or (p)lay again: ",
    (sol) => {
      if (sol === "play" || sol == "p") {
        playRound();
        return;
      }
      if (sol <= 0) {
        console.log("Invalid Number");
        launchExchange();
        return;
      }
      try {
        swapSolWithOrca(sol, () => {
          console.log("Thanks for trading, let's play again...");
          playRound();
        });
      } catch (e) {
        console.log(
          "Error occurred, maybe insufficient funds? (" + e.msg + ")"
        );
        launchExchange();
      }
    }
  );
}

// Program Run
printGreeting();
askForPublicKey();
