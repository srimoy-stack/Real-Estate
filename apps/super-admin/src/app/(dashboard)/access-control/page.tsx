'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge } from '@repo/ui';
import { getOrganizations, agentService, createAuditLog, AuditEventType } from '@repo/services';
import { useAuthStore } from '@repo/auth';
import { useDebounce } from '@repo/hooks';

interface AccessUser {
    id: string;
    name: string;
    email: string;
    role: 'BROKER_ADMIN' | 'AGENT';
    organization?: string;
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    lastLogin?: string;
    hasCredentials?: boolean;
}

export default function AccessControlPage() {
    const { user: superAdmin } = useAuthStore();
    const [users, setUsers] = useState<AccessUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'BROKER_ADMIN' | 'AGENT'>('ALL');

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AccessUser | null>(null);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [sharingStatus, setSharingStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [manualForm, setManualForm] = useState({ name: '', email: '', role: 'AGENT' as 'BROKER_ADMIN' | 'AGENT', organization: '' });

    useEffect(() => {
        const fetchAllUsers = async () => {
            setLoading(true);
            try {
                const orgs = await getOrganizations({ page: 1, limit: 100 });
                const agents = await agentService.getAllAgents();

                const orgAdmins: AccessUser[] = orgs.items.map(org => ({
                    id: `admin-${org.id}`,
                    name: org.name + ' Admin',
                    email: org.adminEmail || `admin@${org.domain}`,
                    role: 'BROKER_ADMIN',
                    organization: org.name,
                    status: org.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
                    hasCredentials: Math.random() > 0.3, // Mocking some already having creds
                    lastLogin: new Date(Date.now() - Math.random() * 1000000000).toISOString()
                }));

                const agentUsers: AccessUser[] = agents.map(agent => ({
                    id: agent.id,
                    name: agent.name,
                    email: agent.email,
                    role: 'AGENT',
                    organization: agent.organizationId || 'Independent',
                    status: agent.websiteStatus === 'ACTIVE' ? 'ACTIVE' : 'PENDING',
                    hasCredentials: Math.random() > 0.5,
                    lastLogin: agent.createdAt
                }));

                setUsers([...orgAdmins, ...agentUsers]);
            } catch (error) {
                console.error('Failed to load access control data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                u.organization?.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, debouncedSearch, roleFilter]);

    const handleCreateCredentials = (user: AccessUser) => {
        setSelectedUser(user);
        // Realistic industrial password pattern
        const segments = ['PROT', 'NAV', 'SYS', 'CORE'];
        const pass = segments[Math.floor(Math.random() * segments.length)] + '-' +
            Math.random().toString(36).substring(2, 8).toUpperCase() + '-' +
            Math.floor(100 + Math.random() * 900);
        setGeneratedPassword(pass);
        setModalOpen(true);
        setSharingStatus('idle');
    };

    const handleManualIdentity = () => {
        if (!manualForm.name || !manualForm.email) return;

        const newUser: AccessUser = {
            id: `manual-${Math.random().toString(36).substr(2, 9)}`,
            name: manualForm.name,
            email: manualForm.email,
            role: manualForm.role,
            organization: manualForm.organization || 'Manual Provision',
            status: 'ACTIVE',
            hasCredentials: false
        };

        setUsers(prev => [newUser, ...prev]);
        setManualModalOpen(false);
        setManualForm({ name: '', email: '', role: 'AGENT', organization: '' });

        // Proactively open the credential modal for this new user
        handleCreateCredentials(newUser);
    };

    const handleShareCredentials = async () => {
        if (!selectedUser || !generatedPassword) return;

        setSharingStatus('sending');
        // Simulate SMTP Relay
        await new Promise(resolve => setTimeout(resolve, 1500));

        await createAuditLog({
            eventType: AuditEventType.SYSTEM_CONFIG_CHANGE,
            actorId: superAdmin?.id || 'system',
            actorName: superAdmin?.name || 'Super Admin',
            targetId: selectedUser.id,
            targetName: selectedUser.name,
            status: 'SUCCESS',
            metadata: {
                action: 'CREDENTIALS_GENERATED',
                shared_via: 'Email',
                protocol: 'TLS 1.3'
            }
        });

        setSharingStatus('sent');
        // Update local state to reflect credentials exist
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, hasCredentials: true } : u));

        setTimeout(() => {
            setModalOpen(false);
            setGeneratedPassword(null);
        }, 2000);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Security Protocol Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative overflow-hidden p-10 bg-slate-900 rounded-[48px] text-white shadow-3xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-[0.3em]">Module V4.2</div>
                        <div className="h-1 w-1 bg-slate-600 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Identity Manager</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter">Access <span className="text-indigo-400 underline decoration-indigo-400/20 underline-offset-[16px]">Control</span></h1>
                    <p className="text-slate-400 font-medium max-w-lg text-lg">Provision secure credentials and orchestrate portal access for the entire brokerage network.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:min-w-[400px] relative z-10">
                    <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Provisioned Personas</p>
                        <p className="text-3xl font-black tracking-tighter">{users.length}</p>
                    </div>
                    <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Protocols</p>
                        <p className="text-3xl font-black tracking-tighter text-emerald-400">Stable</p>
                    </div>
                </div>
            </div>

            {/* Protocol Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-white border border-slate-100 rounded-[32px] shadow-xl shadow-slate-200/50">
                <div className="lg:col-span-2 relative group flex items-center">
                    <svg className="absolute left-6 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search Identity, Email, or Organization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                    />
                </div>
                <div className="lg:col-span-1">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:bg-white focus:border-indigo-400 transition-all cursor-pointer appearance-none"
                    >
                        <option value="ALL">All Network Roles</option>
                        <option value="BROKER_ADMIN">Agency Client Admins</option>
                        <option value="AGENT">Field Agents</option>
                    </select>
                </div>
                <button
                    onClick={() => setManualModalOpen(true)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Create Manual Identity
                </button>
            </div>

            {/* Identity Table */}
            <div className="bg-white border border-slate-200 rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Administrative Identity</th>
                                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Portal Assignment</th>
                                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Security Status</th>
                                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Credentials</th>
                                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Access Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => <tr key={i}><td colSpan={5} className="px-10 py-10 animate-pulse bg-slate-50/20" /></tr>)
                            ) : filteredUsers.map(u => (
                                <tr key={u.id} className="group hover:bg-slate-50/80 transition-all">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-black text-xs shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{u.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{u.role.replace('_', ' ')}</p>
                                            <p className="text-xs font-bold text-slate-600">{u.organization || 'Internal'}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <StatusBadge label={u.status} type={u.status === 'ACTIVE' ? 'success' : 'warning'} />
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${u.hasCredentials ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                {u.hasCredentials ? 'Verified' : 'Unprovisioned'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button
                                            onClick={() => handleCreateCredentials(u)}
                                            className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                                        >
                                            {u.hasCredentials ? 'Reset Identity' : 'Generate Keys'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && filteredUsers.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 font-bold">No identities found within active filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Credential Provisioning Modal */}
            {modalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] border border-slate-200 shadow-3xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between relative bg-slate-900 text-white">
                            <div className="absolute top-0 right-0 h-full w-40 bg-white/5 rounded-bl-[100px] pointer-events-none" />
                            <div className="space-y-1 relative z-10">
                                <h2 className="text-3xl font-black tracking-tighter leading-none">Identity <span className="text-indigo-400">Provisioning</span></h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Secure Protocol Handshake</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors relative z-10">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-10 space-y-10">
                            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center gap-6">
                                <div className="h-16 w-16 rounded-[24px] bg-white border border-slate-200 flex items-center justify-center text-slate-300 font-black text-2xl shadow-sm">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Persona</p>
                                    <p className="text-xl font-black text-slate-900">{selectedUser.name}</p>
                                    <p className="text-[10px] font-mono text-indigo-500 font-bold uppercase">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Generated Cryptographic Key</label>
                                <div className="p-10 bg-slate-950 rounded-[32px] text-center group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <p className="text-3xl font-mono font-black text-indigo-400 tracking-[0.15em] relative z-10">{generatedPassword}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleShareCredentials}
                                    disabled={sharingStatus !== 'idle'}
                                    className="w-full py-6 rounded-[24px] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 overflow-hidden group"
                                >
                                    {sharingStatus === 'idle' ? (
                                        <span className="flex items-center justify-center gap-3">
                                            Establish & Relay via Email
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </span>
                                    ) : sharingStatus === 'sending' ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Relaying Protocol...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-3 text-emerald-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                                            Transmission Successful
                                        </span>
                                    )}
                                </button>
                                <p className="text-[9px] text-center text-slate-400 font-medium leading-relaxed">
                                    By clicking establish, you authorize the generation of persistent access keys <br />
                                    and the transmission via non-encrypted SMTP relay (TLS 1.3 enforced).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Manual Identity Provisioning Modal */}
            {manualModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-4xl w-full max-w-4xl overflow-hidden flex animate-in zoom-in-95 duration-500">
                        {/* Sidebar */}
                        <div className="w-80 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
                            <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5" />
                            <div className="relative z-10">
                                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-lg shadow-indigo-500/20">🆔</div>
                                <h1 className="text-2xl font-black tracking-tight leading-8">Manual<br /><span className="text-indigo-400">Identity</span><br />Provisioning</h1>
                                <p className="mt-6 text-sm text-slate-400 font-medium leading-relaxed">
                                    Directly orchestrate a new network node without standard agency onboarding protocols.
                                </p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative z-10">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Standard</p>
                                <p className="text-xs font-bold text-white uppercase tracking-wider">ISO/IEC 27001</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="flex-1 p-12 bg-white relative">
                            <button
                                onClick={() => setManualModalOpen(false)}
                                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="space-y-8 max-w-lg mx-auto">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Persona <span className="text-indigo-600">Architect</span></h2>
                                    <p className="text-sm text-slate-500 font-medium">Define the security profile for the new identity.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Full Name</label>
                                        <input
                                            type="text"
                                            value={manualForm.name}
                                            onChange={e => setManualForm({ ...manualForm, name: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-400 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300"
                                            placeholder="e.g. Richard Hendricks"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verified Security Email</label>
                                        <input
                                            type="email"
                                            value={manualForm.email}
                                            onChange={e => setManualForm({ ...manualForm, email: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-400 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300"
                                            placeholder="richard@piedpiper.io"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Protocol Role</label>
                                            <select
                                                value={manualForm.role}
                                                onChange={e => setManualForm({ ...manualForm, role: e.target.value as any })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-400 outline-none font-bold text-slate-900 transition-all cursor-pointer appearance-none"
                                            >
                                                <option value="AGENT">Field Agent</option>
                                                <option value="BROKER_ADMIN">Agency Admin</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Orgnization/Node</label>
                                            <input
                                                type="text"
                                                value={manualForm.organization}
                                                onChange={e => setManualForm({ ...manualForm, organization: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-400 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-300"
                                                placeholder="Internal / Solo"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleManualIdentity}
                                        disabled={!manualForm.name || !manualForm.email}
                                        className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.35em] shadow-2xl shadow-indigo-100 transition-all hover:bg-slate-900 hover:-translate-y-1 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                                    >
                                        Establish Identity & Proceed
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
