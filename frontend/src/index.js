import React, { useState } from 'react';
import { Shield, Lock, Zap, CheckCircle, Clock, Pause, Play, X } from 'lucide-react';

const SubscriptionDemo = () => {
const [activeTab, setActiveTab] = useState('subscribe');
const [selectedPlan, setSelectedPlan] = useState('monthly');
const [subscriptionStatus, setSubscriptionStatus] = useState(null);

const plans = [
    { id: 'monthly', name: 'Monthly', price: '0.01 SOL', duration: '30 days' },
    { id: 'quarterly', name: 'Quarterly', price: '0.025 SOL', duration: '90 days' },
    { id: 'annual', name: 'Annual', price: '0.09 SOL', duration: '365 days' }
];

const handleSubscribe = () => {
    setSubscriptionStatus({
        plan: plans.find(p => p.id === selectedPlan),
        active: true,
        paused: false,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
    alert(`Subscription to ${plans.find(p => p.id === selectedPlan).name} plan initiated!\n\nIn a real app, this would connect to your Solana wallet and execute the smart contract.`);
};

const handlePause = () => {
    setSubscriptionStatus({ ...subscriptionStatus, paused: true });
    alert('Subscription paused! Time will be frozen on-chain.');
};

const handleResume = () => {
    setSubscriptionStatus({ ...subscriptionStatus, paused: false });
    alert('Subscription resumed! Your remaining time continues.');
};

const handleCancel = () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
        setSubscriptionStatus(null);
        alert('Subscription cancelled! Account closed and rent returned.');
    }
};

return (
<div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
    {/* Hero Section */}
    <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
            <div className="inline-block mb-6">
                <Shield className="w-20 h-20 mx-auto text-purple-300 animate-pulse" />
            </div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                HERE COULD BE YOUR SERVICE
            </h1>
            <h2 className="text-4xl font-bold mb-6">
                WITH THE SAFEST SUBSCRIPTIONS
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
                Built on Solana blockchain with Anchor framework. Your subscriptions are transparent,
                immutable, and fully controlled by smart contracts.
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
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
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'subscribe'
                    ? 'bg-purple-500/30 border-b-2 border-purple-300'
                    : 'hover:bg-white/5'
                    }`}
                    >
                    Subscribe
                    </button>
                    <button
                            onClick={() => setActiveTab('manage')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'manage'
                    ? 'bg-purple-500/30 border-b-2 border-purple-300'
                    : 'hover:bg-white/5'
                    }`}
                    >
                    Manage Subscription
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {activeTab === 'subscribe' ? (
                    <div>
                        <h3 className="text-2xl font-bold mb-6">Choose Your Plan</h3>
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
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                        Subscribe Now
                    </button>

                    <div className="mt-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                        <p className="text-sm text-blue-200">
                            <strong>Note:</strong> This is a demo interface. In production, you would connect your Solana wallet
                            (Phantom, Solflare, etc.) and sign transactions on-chain.
                        </p>
                    </div>
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
                            : 'bg-green-500/20 text-green-300'
                            }`}>
                            {subscriptionStatus.paused ? 'Paused' : 'Active'}
                            </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <p className="text-sm text-purple-200 mb-2">Current Plan</p>
                                <p className="text-2xl font-bold">{subscriptionStatus.plan.name}</p>
                                <p className="text-purple-300">{subscriptionStatus.plan.price}</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <p className="text-sm text-purple-200 mb-2">Expires On</p>
                                <p className="text-2xl font-bold flex items-center gap-2">
                                    <Clock className="w-6 h-6" />
                                    {subscriptionStatus.endDate}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {subscriptionStatus.paused ? (
                            <button
                                    onClick={handleResume}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Resume Subscription
                            </button>
                            ) : (
                            <button
                                    onClick={handlePause}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Pause className="w-5 h-5" />
                                Pause Subscription
                            </button>
                            )}

                            <button
                                    onClick={handleCancel}
                                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Cancel Subscription
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
        </div>
    </div>
</div>
</div>
);
};

export default SubscriptionDemo;
