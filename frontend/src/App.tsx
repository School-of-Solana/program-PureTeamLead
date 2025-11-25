import SubscriptionApp from "./SubscriptionApp";
import { WalletConnectionProvider } from "./WalletConnector";

export default function App() {
    return (
        <WalletConnectionProvider>
            <SubscriptionApp />
        </WalletConnectionProvider>
    );
}