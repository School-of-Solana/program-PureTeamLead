import SubscriptionDemo from "./SubscriptionDemo";
import { WalletConnectionProvider } from "./WalletConnector";

function App() {
    return (
        <WalletConnectionProvider>
            <SubscriptionDemo />
        </WalletConnectionProvider>
    );
}

export default App;