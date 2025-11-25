import { SUBSCRIPTION_CHAIN_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function SubscriptionChainUiProgramExplorerLink() {
  return <AppExplorerLink address={SUBSCRIPTION_CHAIN_PROGRAM_ADDRESS} label={ellipsify(SUBSCRIPTION_CHAIN_PROGRAM_ADDRESS)} />
}
