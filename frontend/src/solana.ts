import * as anchor from "@coral-xyz/anchor";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { SubscriptionChain } from "../../anchor_project/subscription_chain/target/types/subscription_chain";

// export const PROGRAM_ID = new PublicKey(idl.metadata.address);

export const useProgram = () => {
    const wallet = useAnchorWallet();
    const connection = new Connection("https://api.devnet.solana.com");

    if (!wallet) return null;

    // const provider = new AnchorProvider(connection, wallet, {
    //     commitment: "confirmed",
    // });

    return anchor.workspace.subscriptionChain as Program<SubscriptionChain>;
};

