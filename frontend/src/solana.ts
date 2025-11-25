import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idl from "./idl/subscription_chain.json";

// Program ID from the deployed program (Devnet)
export const PROGRAM_ID = new PublicKey("8ZHxyWD1BV6qjBx3nk7DQJMuphC8GJpbRqaX85qC79AD");

// Constants matching the program seeds
export const CONFIG_SEED = "config";
export const SUBSCRIPTION_SEED = "SUBSCRIPTION_SEED";

// Subscription types matching the program
export enum SubscriptionType {
    Month = 0,
    Quartal = 1,
    Annual = 2
}

// Get program instance
export const getProgram = (connection: Connection, wallet: AnchorWallet) => {
    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Program(idl as any, provider);
};

// Custom hook for getting program
export const useProgram = () => {
    const wallet = useAnchorWallet();
    const connection = useMemo(() => new Connection("https://api.devnet.solana.com", "confirmed"), []);

    return useMemo(() => {
        if (!wallet) return null;
        return getProgram(connection, wallet);
    }, [wallet, connection]);
};

// Get config PDA
export const getConfigPDA = () => {
    const [configPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(CONFIG_SEED)],
        PROGRAM_ID
    );
    return configPDA;
};

// Get subscription PDA for a subscriber
export const getSubscriptionPDA = (subscriber: PublicKey) => {
    const [subscriptionPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SUBSCRIPTION_SEED), subscriber.toBuffer()],
        PROGRAM_ID
    );
    return subscriptionPDA;
};

// Create creator profile (admin setup)
export const createCreatorProfile = async (
    program: Program,
    monthlyPrice: number,
    quartalPrice: number,
    annualPrice: number
) => {
    const configPDA = getConfigPDA();
    const creator = program.provider.publicKey;
    
    if (!creator) throw new Error("Wallet not connected");

    const tx = await program.methods
        .createCreatorProfile(
            new BN(monthlyPrice),
            new BN(quartalPrice),
            new BN(annualPrice)
        )
        .accounts({
            creator,
            config: configPDA,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
    
    return tx;
};

// Subscribe to a plan
export const subscribe = async (
    program: Program,
    subscriptionType: SubscriptionType,
    creatorPubkey: PublicKey
) => {
    const configPDA = getConfigPDA();
    const subscriber = program.provider.publicKey;
    
    if (!subscriber) throw new Error("Wallet not connected");

    const subscriptionPDA = getSubscriptionPDA(subscriber);
    
    // Convert enum to anchor format
    const typ = subscriptionType === SubscriptionType.Month 
        ? { month: {} } 
        : subscriptionType === SubscriptionType.Quartal 
            ? { quartal: {} } 
            : { annual: {} };

    const tx = await program.methods
        .subscription(typ)
        .accounts({
            creator: creatorPubkey,
            config: configPDA,
            subscriber,
            subscription: subscriptionPDA,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
    
    return tx;
};

// Cancel subscription
export const cancelSubscription = async (program: Program) => {
    const subscriber = program.provider.publicKey;
    
    if (!subscriber) throw new Error("Wallet not connected");

    const subscriptionPDA = getSubscriptionPDA(subscriber);

    const tx = await program.methods
        .cancelSubscription()
        .accounts({
            subscriber,
            subscription: subscriptionPDA,
        })
        .rpc();
    
    return tx;
};

// Pause subscription
export const pauseSubscription = async (program: Program) => {
    const subscriber = program.provider.publicKey;
    
    if (!subscriber) throw new Error("Wallet not connected");

    const subscriptionPDA = getSubscriptionPDA(subscriber);

    const tx = await program.methods
        .pauseSubscription()
        .accounts({
            subscriber,
            subscription: subscriptionPDA,
        })
        .rpc();
    
    return tx;
};

// Resume subscription
export const resumeSubscription = async (program: Program) => {
    const subscriber = program.provider.publicKey;
    
    if (!subscriber) throw new Error("Wallet not connected");

    const subscriptionPDA = getSubscriptionPDA(subscriber);

    const tx = await program.methods
        .resumeSubscription()
        .accounts({
            subscriber,
            subscription: subscriptionPDA,
        })
        .rpc();
    
    return tx;
};

// Extend subscription
export const extendSubscription = async (
    program: Program,
    subscriptionType: SubscriptionType,
    creatorPubkey: PublicKey
) => {
    const configPDA = getConfigPDA();
    const subscriber = program.provider.publicKey;
    
    if (!subscriber) throw new Error("Wallet not connected");

    const subscriptionPDA = getSubscriptionPDA(subscriber);
    
    const typ = subscriptionType === SubscriptionType.Month 
        ? { month: {} } 
        : subscriptionType === SubscriptionType.Quartal 
            ? { quartal: {} } 
            : { annual: {} };

    const tx = await program.methods
        .extendSubscription(typ)
        .accounts({
            creator: creatorPubkey,
            subscriber,
            subscription: subscriptionPDA,
            config: configPDA,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
    
    return tx;
};

// Update creator prices
export const updateCreatorPrice = async (
    program: Program,
    monthlyPrice: number | null,
    quartalPrice: number | null,
    annualPrice: number | null
) => {
    const configPDA = getConfigPDA();
    const creator = program.provider.publicKey;
    
    if (!creator) throw new Error("Wallet not connected");

    const tx = await program.methods
        .updateCreatorPrice(
            monthlyPrice !== null ? new BN(monthlyPrice) : null,
            quartalPrice !== null ? new BN(quartalPrice) : null,
            annualPrice !== null ? new BN(annualPrice) : null
        )
        .accounts({
            creator,
            config: configPDA,
        })
        .rpc();
    
    return tx;
};

// Fetch config account data
export const fetchConfig = async (program: Program) => {
    const configPDA = getConfigPDA();
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config = await (program.account as any).config.fetch(configPDA);
        return config;
    } catch {
        return null;
    }
};

// Fetch subscription account data
export const fetchSubscription = async (program: Program, subscriber: PublicKey) => {
    const subscriptionPDA = getSubscriptionPDA(subscriber);
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = await (program.account as any).subscription.fetch(subscriptionPDA);
        return subscription;
    } catch {
        return null;
    }
};
