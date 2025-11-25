import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";
import { SubscriptionChain } from "../target/types/subscription_chain";
import BN from "bn.js";
import { describe, it } from "mocha";

const CONFIG_SEED = "config";
const SUBSCRIPTION_SEED = "SUBSCRIPTION_SEED";

describe("subscription_chain", () => {
  // Configure the client to use the local cluster.
    let provider = anchor.AnchorProvider.env()
    anchor.setProvider(provider);

    const creator = anchor.web3.Keypair.generate();
    const vadim = anchor.web3.Keypair.generate();
    const maxim = anchor.web3.Keypair.generate();

  const program = anchor.workspace.subscriptionChain as Program<SubscriptionChain>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Successful config initialization", async () => {
      await airdrop(provider.connection, creator.publicKey, 10_000_000_000)
      const [config_key, config_bump] = getConfigAddress(program.programId)

      const monthPrice = new BN(10_000_000)
      const quartalPrice = new BN(20_000_000)
      const annualPrice = new BN(50_000_000)

      const tx =
        await program.methods.createCreatorProfile(monthPrice, quartalPrice, annualPrice)
            .accounts(
                {
                    config: config_key,
                    creator: creator.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                }
            )
            .signers([creator])
            .rpc()
    console.log("Your transaction signature", tx);

    await checkConfig(program, config_key, creator.publicKey, monthPrice, quartalPrice, annualPrice, config_bump)
  })

    it("Invalid price config initialization", async () => {
        await airdrop(provider.connection, creator.publicKey, 10_000_000_000)
        const [config_key, config_bump] = getConfigAddress(program.programId)

        const monthPrice = new BN(0);
        const quartalPrice = new BN(20_000_000);
        const annualPrice = new BN(50_000_000);

        let shouldFail = "this should fail"
        try {
            const tx =
                await program.methods.createCreatorProfile(monthPrice, quartalPrice, annualPrice)
                    .accounts(
                        {
                            config: config_key,
                            creator: creator.publicKey,
                            systemProgram: anchor.web3.SystemProgram.programId
                        }
                    )
                    .signers([creator])
                    .rpc()
            console.log("Your transaction signature", tx);

        }catch (error) {
            shouldFail = "Failed"
        }
        assert.strictEqual(shouldFail, "Failed", "Should not be able to set invalid price for the subscription type in config init")
    })

    it("Successful update price", async () => {
        const [config_key, config_bump] = getConfigAddress(program.programId)
        const new_quartal_price = new BN(25_000_000)

        const tx = await program.methods.updateCreatorPrice(null, new_quartal_price, null).accounts(
            {
                creator: creator.publicKey,
                config: config_key
            }
        ).signers([creator]).rpc()
        console.log("Your transaction signature", tx);

        await checkConfig(program, config_key, creator.publicKey, null, new_quartal_price, null, config_bump)
    })

    it("Unsuccessful update price - invalid price", async () => {
        const [config_key, config_bump] = getConfigAddress(program.programId)
        const new_quartal_price = new BN(0)

        let shouldFail = "this should fail"

        try {
            const tx = await program.methods.updateCreatorPrice(null, new_quartal_price, null).accounts(
                {
                    creator: creator.publicKey,
                    config: config_key
                }
            ).signers([creator]).rpc()
            console.log("Your transaction signature", tx);
        } catch (error) {
            shouldFail = "Failed"
            assert.isTrue(error.message.includes("too low"), "Expected config price too low error on setting negative price for updating price instruction")
        }
        assert.strictEqual(shouldFail, "Failed", "Should not be able to set invalid price for the subscription type in config update price")
    })

    it("Successful subscription initialization", async () => {
        const [config_key, config_bump] = getConfigAddress(program.programId)
        await airdrop(provider.connection, vadim.publicKey, 50_000_000)
        const [subscription_key, subscription_bump] = getSubscriptionAddress(vadim.publicKey, program.programId)

        const secondsIn30Days = 30 * 24 * 60 * 60;
        const endTimestamp = Math.floor(Date.now() / 1000) + secondsIn30Days;
        const tx = await program.methods.subscription({month:{}}).accounts(
            {
                subscriber: vadim.publicKey,
                creator: creator.publicKey,
                config: config_key,
                subscription: subscription_key,
                systemProgram: anchor.web3.SystemProgram.programId
            }
        ).signers([vadim]).rpc()
        console.log("Your transaction signature", tx);

        await checkSubscription(program, subscription_key, vadim.publicKey, endTimestamp, null, {month:{}}.month.toString(), subscription_bump)
    })

    it("Successful cancelling of subscription", async () => {
        const [config_key, config_bump] = getConfigAddress(program.programId)
        const [subscription_key, subscription_bump] = getSubscriptionAddress(vadim.publicKey, program.programId)

        const tx = await program.methods.cancelSubscription().accounts(
            {
                subscriber: vadim.publicKey,
                subscription: subscription_key
            }
        ).signers([vadim]).rpc()
        console.log("Your transaction signature", tx);

        let shouldFail = "this should fail"
        try {
            let subData = await program.account.subscription.fetch(subscription_key)
        } catch (error) {
            shouldFail = "failed"
            assert.isTrue(error.message.includes("Account does not exist or has no data"), "Failed test, subscription account was not deleted")
        }

        assert.strictEqual(shouldFail, "failed", "Cannot cancel subscription twice")
    })

    it("Successful extending of subscription", async () => {
        const [config_key, config_bump] = getConfigAddress(program.programId)
        await airdrop(provider.connection, vadim.publicKey, 100_000_000)
        const [subscription_key, subscription_bump] = getSubscriptionAddress(vadim.publicKey, program.programId)

        const secondsIn365Days = 365 * 24 * 60 * 60;
        const secondsIn30Days = 30 * 24 * 60 * 60;
        const end_timestamp = Math.floor(Date.now() / 1000) + secondsIn365Days + secondsIn30Days; // +2 for the test speed

        await program.methods.subscription({month: {}}).accounts(
            {
                creator: creator.publicKey,
                subscriber: vadim.publicKey,
                config: config_key,
                subscription: subscription_key,
                systemProgram: anchor.web3.SystemProgram.programId
            }
        ).signers([vadim]).rpc()

        const tx = await program.methods.extendSubscription({annual: {}}).accounts(
            {
                creator: creator.publicKey,
                subscriber: vadim.publicKey,
                config: config_key,
                subscription: subscription_key,
                systemProgram: anchor.web3.SystemProgram.programId
            }
        ).signers([vadim]).rpc()
        console.log("Your transaction signature", tx);

        await checkSubscription(program, subscription_key, vadim.publicKey, end_timestamp, null, {annual: {}}.annual.toString(), subscription_bump)
    })

    it("Invalid extending of subscription - no subscription", async () => {
        const [config_key, config_bump] = getConfigAddress(program.programId)
        const [subscription_key, subscription_bump] = getSubscriptionAddress(vadim.publicKey, program.programId)

        let shouldFail = "this should fail"
        try {
            const tx = await program.methods.extendSubscription({annual: {}}).accounts(
                {
                    creator: creator.publicKey,
                    subscriber: maxim.publicKey,
                    config: config_key,
                    subscription: subscription_key,
                    systemProgram: anchor.web3.SystemProgram.programId
                }
            ).signers([maxim]).rpc()
            console.log("Your transaction signature", tx);
        } catch (error) {
            shouldFail = "failed"
        }
        assert.strictEqual(shouldFail, "failed", "Shouldn't be able to extend non-existent subscription")
    })
});

async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

async function checkSubscription(program: anchor.Program<SubscriptionChain>,  subscription: PublicKey, subscriber: PublicKey, end_timestamp: number, paused_at?: number, typ?:String, bump?: number) {
    let subscriptionData = await program.account.subscription.fetch(subscription);
    assert.strictEqual(subscriptionData.subscriber.toString(), subscriber.toString(), `Subscriber should be ${subscriber.toString()} but was ${subscriptionData.subscriber.toString()}`)
    assert.strictEqual(subscriptionData.endTimestamp.toString(), end_timestamp.toString())

    if (paused_at) {
        assert.strictEqual(subscriptionData.pausedAt.toString(), paused_at.toString(), `Subscription paused timestamp should be ${paused_at.toString()} but was ${subscriptionData.pausedAt.toString()}`);
    }

    if (typ) {
        assert.strictEqual(subscriptionData.typ.toString(), typ.toString(), `Config month price should be ${typ.toString()} but was ${subscriptionData.typ.toString()}`);
    }

    if (bump) {
        assert.strictEqual(subscriptionData.bump.toString(), bump.toString(), `Subscription bump should be ${bump} but was ${subscriptionData.bump}`)
    }

//      TODO: pause and resume tests(happy and unhappy)
}

async function checkConfig(program: anchor.Program<SubscriptionChain>, config: PublicKey, creator: PublicKey, monthly?: BN, quartal?: BN, annual?: BN, bump?: number,) {
    let configData = await program.account.config.fetch(config);
    assert.strictEqual(configData.creator.toString(), creator.toString(), `Config author should be ${creator.toString()} but was ${configData.creator.toString()}`)

    if (monthly) {
        assert.strictEqual(configData.monthPrice.toString(), monthly.toString(), `Config month price should be ${monthly.toString()} but was ${configData.monthPrice.toString()}`);
    }

    if (quartal) {
        assert.strictEqual(configData.quartalPrice.toString(), quartal.toString(), `Config quartal price should be ${quartal.toString()} but was ${configData.quartalPrice.toString()}`);
    }

    if (annual) {
        assert.strictEqual(configData.annualPrice.toString(), annual.toString(), `Config annual price should be ${annual.toString()} but was ${configData.annualPrice.toString()}`);
    }

    if (bump) {
        assert.strictEqual(configData.bump.toString(), bump.toString(), `Config bump should be ${bump} but was ${configData.bump}`)
    }
}

function getSubscriptionAddress(subscriber: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode(SUBSCRIPTION_SEED),
        subscriber.toBuffer()
      ], programID);
}

function getConfigAddress(programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode(CONFIG_SEED),
      ], programID);
}
