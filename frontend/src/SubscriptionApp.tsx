import { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Zap, CheckCircle, Clock, Pause, Play, X, Settings, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { 
    useProgram, 
    SubscriptionType, 
    createCreatorProfile, 
    subscribe, 
    cancelSubscription, 
    pauseSubscription, 
    resumeSubscription,
    fetchConfig,
    fetchSubscription
} from './solana';

// Define plan interface
interface Plan {
    id: string;
    name: string;
    price: string;
    priceInLamports: number;
    duration: string;
    type: SubscriptionType;
}

// Define subscription status interface
interface SubscriptionStatus {
    plan: Plan;
    active: boolean;
    paused: boolean;
    endDate: string;
    pausedAt: number;
}

// Define config interface
interface ConfigData {
    creator: PublicKey;
    monthPrice: { toNumber: () => number };
    quartalPrice: { toNumber: () => number };
    annualPrice: { toNumber: () => number };
}

// Define subscription data interface
interface SubscriptionData {
    subscriber: PublicKey;
    pausedAt: { toNumber: () => number };
    typ: { month?: object; quartal?: object; annual?: object };
    endTimestamp: { toNumber: () => number };
}

export default function SubscriptionApp() {
    const { connected, publicKey } = useWallet();
    const program = useProgram();
    
    const [activeTab, setActiveTab] = useState<'subscribe' | 'manage' | 'admin'>('subscribe');
    const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [configExists, setConfigExists] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [creatorAddress, setCreatorAddress] = useState<PublicKey | null>(null);
    
    // Admin setup state
    const [monthlyPrice, setMonthlyPrice] = useState<string>('10000000'); // 0.01 SOL in lamports
    const [quartalPrice, setQuartalPrice] = useState<string>('25000000'); // 0.025 SOL in lamports
    const [annualPrice, setAnnualPrice] = useState<string>('90000000'); // 0.09 SOL in lamports

    const plans: Plan[] = [
        { id: 'monthly', name: 'Monthly', price: '0.01 SOL', priceInLamports: 10000000, duration: '30 days', type: SubscriptionType.Month },
        { id: 'quarterly', name: 'Quarterly', price: '0.025 SOL', priceInLamports: 25000000, duration: '90 days', type: SubscriptionType.Quartal },
        { id: 'annual', name: 'Annual', price: '0.09 SOL', priceInLamports: 90000000, duration: '365 days', type: SubscriptionType.Annual }
    ];

    // Fetch config and subscription data
    const fetchData = useCallback(async () => {
        if (!program || !publicKey) return;
        
        try {
            const config = await fetchConfig(program) as ConfigData | null;
            if (config) {
                setConfigExists(true);
                setCreatorAddress(config.creator);
                setIsAdmin(config.creator.equals(publicKey));
                
                // Update plans with actual prices from config
                plans[0].priceInLamports = config.monthPrice.toNumber();
                plans[0].price = `${(config.monthPrice.toNumber() / 1e9).toFixed(4)} SOL`;
                plans[1].priceInLamports = config.quartalPrice.toNumber();
                plans[1].price = `${(config.quartalPrice.toNumber() / 1e9).toFixed(4)} SOL`;
                plans[2].priceInLamports = config.annualPrice.toNumber();
                plans[2].price = `${(config.annualPrice.toNumber() / 1e9).toFixed(4)} SOL`;
            } else {
                setConfigExists(false);
            }

            // Fetch subscription
            const subscription = await fetchSubscription(program, publicKey) as SubscriptionData | null;
            if (subscription) {
                const endTimestamp = subscription.endTimestamp.toNumber();
                const pausedAt = subscription.pausedAt.toNumber();
                const now = Math.floor(Date.now() / 1000);
                
                // Determine subscription type
                let planId = 'monthly';
                let planType = SubscriptionType.Month;
                if (subscription.typ.quartal) {
                    planId = 'quarterly';
                    planType = SubscriptionType.Quartal;
                } else if (subscription.typ.annual) {
                    planId = 'annual';
                    planType = SubscriptionType.Annual;
                }
                
                const plan = plans.find(p => p.id === planId) || plans[0];
                
                setSubscriptionStatus({
                    plan: { ...plan, type: planType },
                    active: endTimestamp > now,
                    paused: pausedAt > 0,
                    endDate: new Date(endTimestamp * 1000).toLocaleDateString(),
                    pausedAt: pausedAt
                });
            } else {
                setSubscriptionStatus(null);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [program, publicKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Admin: Create creator profile
    const handleAdminSetup = async () => {
        if (!program) return;
        
        setLoading(true);
        try {
            const tx = await createCreatorProfile(
                program,
                parseInt(monthlyPrice),
                parseInt(quartalPrice),
                parseInt(annualPrice)
            );
            console.log('Creator profile created:', tx);
            alert(`Creator profile created successfully!\nTransaction: ${tx}`);
            await fetchData();
        } catch (error) {
            console.error('Error creating creator profile:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Subscribe to a plan
    const handleSubscribe = async () => {
        if (!program || !creatorAddress) return;
        
        const plan = plans.find(p => p.id === selectedPlan);
        if (!plan) return;

        setLoading(true);
        try {
            const tx = await subscribe(program, plan.type, creatorAddress);
            console.log('Subscription created:', tx);
            alert(`Subscribed to ${plan.name} plan!\nTransaction: ${tx}`);
            await fetchData();
        } catch (error) {
            console.error('Error subscribing:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Pause subscription
    const handlePause = async () => {
        if (!program) return;
        
        setLoading(true);
        try {
            const tx = await pauseSubscription(program);
            console.log('Subscription paused:', tx);
            alert(`Subscription paused!\nTransaction: ${tx}`);
            await fetchData();
        } catch (error) {
            console.error('Error pausing:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Resume subscription
    const handleResume = async () => {
        if (!program) return;
        
        setLoading(true);
        try {
            const tx = await resumeSubscription(program);
            console.log('Subscription resumed:', tx);
            alert(`Subscription resumed!\nTransaction: ${tx}`);
            await fetchData();
        } catch (error) {
            console.error('Error resuming:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Cancel subscription
    const handleCancel = async () => {
        if (!program) return;
        
        if (!window.confirm('Are you sure you want to cancel your subscription?')) return;

        setLoading(true);
        try {
            const tx = await cancelSubscription(program);
            console.log('Subscription cancelled:', tx);
            alert(`Subscription cancelled! Rent returned.\nTransaction: ${tx}`);
            await fetchData();
        } catch (error) {
            console.error('Error cancelling:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Render wallet connection prompt
    if (!connected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center">
                        <Shield className="w-20 h-20 mx-auto text-purple-300 animate-pulse mb-6" />
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                            Subscription Chain
                        </h1>
                        <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-8">
                            Connect your wallet to access the subscription service on Solana blockchain.
                        </p>
                        <div className="flex justify-center">
                            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600 !rounded-xl !py-3 !px-6 !font-bold" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render admin setup if config doesn't exist
    if (configExists === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold">Admin Setup</h1>
                            <WalletMultiButton className="!bg-purple-500/50 !rounded-lg" />
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Settings className="w-8 h-8 text-purple-300" />
                                <h2 className="text-2xl font-bold">Initialize Creator Profile</h2>
                            </div>
                            
                            <p className="text-purple-200 mb-6">
                                Welcome! As the first user, you will become the admin (creator) of this subscription service.
                                Set your subscription prices below.
                            </p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm text-purple-200 mb-2">Monthly Price (lamports)</label>
                                    <input
                                        type="number"
                                        value={monthlyPrice}
                                        onChange={(e) => setMonthlyPrice(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                                        placeholder="10000000"
                                    />
                                    <p className="text-xs text-purple-300 mt-1">≈ {(parseInt(monthlyPrice || '0') / 1e9).toFixed(4)} SOL</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-purple-200 mb-2">Quarterly Price (lamports)</label>
                                    <input
                                        type="number"
                                        value={quartalPrice}
                                        onChange={(e) => setQuartalPrice(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                                        placeholder="25000000"
                                    />
                                    <p className="text-xs text-purple-300 mt-1">≈ {(parseInt(quartalPrice || '0') / 1e9).toFixed(4)} SOL</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-purple-200 mb-2">Annual Price (lamports)</label>
                                    <input
                                        type="number"
                                        value={annualPrice}
                                        onChange={(e) => setAnnualPrice(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                                        placeholder="90000000"
                                    />
                                    <p className="text-xs text-purple-300 mt-1">≈ {(parseInt(annualPrice || '0') / 1e9).toFixed(4)} SOL</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleAdminSetup}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Creator Profile'}
                            </button>
                            
                            <p className="text-sm text-purple-200/70 mt-4 text-center">
                                Your wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state while fetching config
    if (configExists === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-300 mx-auto mb-4"></div>
                    <p className="text-purple-200">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
            {/* Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-purple-300" />
                        <span className="text-xl font-bold">Subscription Chain</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <span className="bg-purple-500/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                <Settings className="w-4 h-4" /> Admin
                            </span>
                        )}
                        <WalletMultiButton className="!bg-purple-500/50 !rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                        Subscription Service
                    </h1>
                    <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
                        Built on Solana blockchain with Anchor framework. Your subscriptions are transparent,
                        immutable, and fully controlled by smart contracts.
                    </p>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                            <Lock className="w-8 h-8 mx-auto mb-3 text-purple-300" />
                            <h3 className="font-bold mb-2">100% Secure</h3>
                            <p className="text-sm text-purple-200">Smart contract verified on Solana</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                            <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
                            <h3 className="font-bold mb-2">Lightning Fast</h3>
                            <p className="text-sm text-purple-200">Instant on-chain transactions</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                            <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-300" />
                            <h3 className="font-bold mb-2">Transparent</h3>
                            <p className="text-sm text-purple-200">All payments on public ledger</p>
                        </div>
                    </div>
                </div>

                {/* Main App Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-white/20">
                            <button
                                onClick={() => setActiveTab('subscribe')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                                    activeTab === 'subscribe'
                                        ? 'bg-purple-500/30 border-b-2 border-purple-300'
                                        : 'hover:bg-white/5'
                                }`}
                            >
                                <Wallet className="w-5 h-5" />
                                Subscribe
                            </button>
                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                                    activeTab === 'manage'
                                        ? 'bg-purple-500/30 border-b-2 border-purple-300'
                                        : 'hover:bg-white/5'
                                }`}
                            >
                                <Settings className="w-5 h-5" />
                                Manage
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {activeTab === 'subscribe' ? (
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Choose Your Plan</h3>
                                    
                                    {subscriptionStatus ? (
                                        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 mb-6">
                                            <p className="text-green-300">
                                                You already have an active subscription. Go to the Manage tab to view or modify it.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid md:grid-cols-3 gap-4 mb-8">
                                                {plans.map(plan => (
                                                    <div
                                                        key={plan.id}
                                                        onClick={() => setSelectedPlan(plan.id)}
                                                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                                                            selectedPlan === plan.id
                                                                ? 'border-purple-400 bg-purple-500/20 scale-105'
                                                                : 'border-white/20 bg-white/5 hover:border-purple-300'
                                                        }`}
                                                    >
                                                        <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                                                        <p className="text-3xl font-bold text-purple-300 mb-2">{plan.price}</p>
                                                        <p className="text-sm text-purple-200">{plan.duration}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={handleSubscribe}
                                                disabled={loading || !creatorAddress}
                                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                                            >
                                                {loading ? 'Processing...' : 'Subscribe Now'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {subscriptionStatus ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-2xl font-bold">Your Subscription</h3>
                                                <span className={`px-4 py-2 rounded-full font-semibold ${
                                                    subscriptionStatus.paused
                                                        ? 'bg-yellow-500/20 text-yellow-300'
                                                        : subscriptionStatus.active
                                                            ? 'bg-green-500/20 text-green-300'
                                                            : 'bg-red-500/20 text-red-300'
                                                }`}>
                                                    {subscriptionStatus.paused ? 'Paused' : subscriptionStatus.active ? 'Active' : 'Expired'}
                                                </span>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                                    <p className="text-sm text-purple-200 mb-2">Current Plan</p>
                                                    <p className="text-2xl font-bold">{subscriptionStatus.plan.name}</p>
                                                    <p className="text-purple-300">{subscriptionStatus.plan.price}</p>
                                                </div>
                                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                                    <p className="text-sm text-purple-200 mb-2">
                                                        {subscriptionStatus.paused ? 'Paused Since' : 'Expires On'}
                                                    </p>
                                                    <p className="text-2xl font-bold flex items-center gap-2">
                                                        <Clock className="w-6 h-6" />
                                                        {subscriptionStatus.paused 
                                                            ? new Date(subscriptionStatus.pausedAt * 1000).toLocaleDateString()
                                                            : subscriptionStatus.endDate
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {subscriptionStatus.paused ? (
                                                    <button
                                                        onClick={handleResume}
                                                        disabled={loading}
                                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        <Play className="w-5 h-5" />
                                                        {loading ? 'Processing...' : 'Resume Subscription'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handlePause}
                                                        disabled={loading || !subscriptionStatus.active}
                                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        <Pause className="w-5 h-5" />
                                                        {loading ? 'Processing...' : 'Pause Subscription'}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <X className="w-5 h-5" />
                                                    {loading ? 'Processing...' : 'Cancel Subscription'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Shield className="w-16 h-16 mx-auto mb-4 text-purple-300 opacity-50" />
                                            <p className="text-xl text-purple-200 mb-4">No active subscription</p>
                                            <button
                                                onClick={() => setActiveTab('subscribe')}
                                                className="text-purple-300 hover:text-purple-200 font-semibold underline"
                                            >
                                                Subscribe now →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tech Stack Info */}
                    <div className="mt-8 text-center text-purple-200 text-sm">
                        <p className="mb-2">Powered by Solana blockchain • Built with Anchor framework</p>
                        <p className="font-mono text-xs opacity-70">Program ID: 8ZHxyWD1BV6qjBx3nk7DQJMuphC8GJpbRqaX85qC79AD</p>
                        {creatorAddress && (
                            <p className="font-mono text-xs opacity-70 mt-1">Creator: {creatorAddress.toBase58().slice(0, 8)}...{creatorAddress.toBase58().slice(-8)}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
