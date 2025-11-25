// Here we export some useful types and functions for interacting with the Anchor program.
import SubscriptionChainIDL from '../target/idl/subscription_chain.json'

// Re-export the generated IDL and type
export { SubscriptionChainIDL }

export * from './client/js'
