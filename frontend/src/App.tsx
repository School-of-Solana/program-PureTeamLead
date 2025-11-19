import SubscriptionDemo from "./index.jsx";
import { WalletConnectionProvider } from "./WalletConnector";

export default function App() {
    return (
        <WalletConnectionProvider>
            <SubscriptionDemo />
        </WalletConnectionProvider>
    );
}