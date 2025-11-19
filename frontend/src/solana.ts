import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./idl.json";   // Export this from Anchor build
import { useAnchorWallet } from "@solana/wallet-adapter-react";

export const PROGRAM_ID = new PublicKey("8ZHxyWD1BV6qjBx3nk7DQJMuphC8GJpbRqaX85qC79AD");

export const useProgram = () => {
    const wallet = useAnchorWallet();
    const connection = new Connection("https://api.devnet.solana.com");

    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    return new Program(idl as Idl, PROGRAM_ID, provider);
};