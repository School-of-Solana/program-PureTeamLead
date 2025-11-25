import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { SubscriptionChainUiProgramExplorerLink } from './ui/subscription-chain-ui-program-explorer-link'
import { SubscriptionChainUiCreate } from './ui/subscription-chain-ui-create'
import { SubscriptionChainUiProgram } from '@/features/subscription-chain/ui/subscription-chain-ui-program'

export default function SubscriptionChainFeature() {
  const { account } = useSolana()

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <WalletDropdown />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHero title="SubscriptionChain" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <SubscriptionChainUiProgramExplorerLink />
        </p>
        <SubscriptionChainUiCreate account={account} />
      </AppHero>
      <SubscriptionChainUiProgram />
    </div>
  )
}
