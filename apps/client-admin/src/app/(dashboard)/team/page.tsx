'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole, TemplateDefinition } from '@repo/types';
import { getAssignedTemplates, createWebsiteInstance } from '@repo/services';
import { useAuth } from '@repo/auth';


interface TeamMember extends Partial<User> {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'active' | 'invited' | 'suspended';
    avatar: string;
    activeListings: number;
    totalLeads: number;
    joinedAt: string;
    tenantId: string;
    templateId: string;
}

const mockTeam: TeamMember[] = [
    { id: '1', name: 'David Armstrong', email: 'david@prestigerealty.com', role: 'client_admin', status: 'active', avatar: 'DA', activeListings: 18, totalLeads: 142, joinedAt: '2024-01-15', isActive: true, tenantId: 'TENANT_1', templateId: 'corporate-brokerage' },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah@prestigerealty.com', role: 'agent', status: 'active', avatar: 'SJ', activeListings: 12, totalLeads: 89, joinedAt: '2024-03-20', isActive: true, tenantId: 'TENANT_1', templateId: 'agent-portfolio' },
    { id: '3', name: 'Michael Chen', email: 'michael@prestigerealty.com', role: 'agent', status: 'active', avatar: 'MC', activeListings: 8, totalLeads: 56, joinedAt: '2024-06-10', isActive: true, tenantId: 'TENANT_1', templateId: 'modern-realty' },
    { id: '4', name: 'Emily Park', email: 'emily@prestigerealty.com', role: 'agent', status: 'invited', avatar: 'EP', activeListings: 0, totalLeads: 0, joinedAt: '2026-03-01', isActive: false, tenantId: 'TENANT_1', templateId: 'agent-portfolio' },
    { id: '5', name: 'James Wilson', email: 'james@prestigerealty.com', role: 'agent', status: 'suspended', avatar: 'JW', activeListings: 0, totalLeads: 34, joinedAt: '2025-01-05', isActive: false, tenantId: 'TENANT_1', templateId: 'agent-portfolio' },
];

export default function TeamPage() {
    // Simulation: Toggle current user role
    const { user } = useAuth();
    const [currentUserRole, setCurrentUserRole] = useState<UserRole>('client_admin');
    const [team, setTeam] = useState<TeamMember[]>(mockTeam);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState({ email: '', name: '', role: 'agent' as UserRole, templateId: 'agent-portfolio' });

    const isBrokerageAdmin = currentUserRole === 'client_admin' || currentUserRole === 'super_admin';
    const currentTenantId = user?.tenantId || 'TENANT_1'; // Consistent baseline for demo

    // Auth-driven State
    const [authorizedTemplates, setAuthorizedTemplates] = useState<TemplateDefinition[]>([]);

    useEffect(() => {
        const loadTemplates = async () => {
            if (!currentTenantId) return;
            try {
                const assigned = await getAssignedTemplates(currentTenantId);
                // In a real scenario we'd map these to the actual TemplateDefinition objects
                // Mocking with IDs for the dropdown
                const tpls = assigned.map(a => ({ id: a.templateId, name: a.templateId.replace('-', ' ') } as TemplateDefinition));
                setAuthorizedTemplates(tpls);
                if (tpls.length > 0) {
                    setFormData(prev => ({ ...prev, templateId: tpls[0].id }));
                }
            } catch (err) {
                console.error('Failed to load brokerage templates', err);
            }
        };
        loadTemplates();
    }, [currentTenantId]);

    // Logic: Force visibility for ALL roles in development to solve "invisible" bug.
    const visibleTeam = team;

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
        invited: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
        suspended: 'bg-red-500/10 text-red-600 border-red-200/50',
    };

    const roleLabels: Record<UserRole, string> = {
        super_admin: 'Platform Admin',
        client_admin: 'Brokerage Admin',
        agent: 'Real Estate Agent',
        viewer: 'Guest Viewer'
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBrokerageAdmin) return;

        const agentId = Math.random().toString(36).substr(2, 9);
        const newMember: TeamMember = {
            id: agentId,
            name: formData.name || formData.email.split('@')[0],
            email: formData.email,
            role: formData.role,
            status: 'invited',
            avatar: (formData.name || formData.email).substring(0, 2).toUpperCase(),
            activeListings: 0,
            totalLeads: 0,
            joinedAt: new Date().toISOString().split('T')[0],
            isActive: false,
            tenantId: currentTenantId, // Enforce tenant ownership
            templateId: formData.templateId
        };

        // PROVISIONING: Call the WebsiteInstance generation service
        if (formData.role === 'agent') {
            await createWebsiteInstance({
                tenantId: currentTenantId,
                agentId: agentId,
                templateId: formData.templateId,
                domain: `${newMember.name.toLowerCase().replace(/\s+/g, '')}.realestate-platform.com`,
            });
        }

        setTeam([...team, newMember]);
        setShowInviteModal(false);
        setFormData({ email: '', name: '', role: 'agent', templateId: 'agent-portfolio' });
    };

    const handleToggleStatus = (id: string, currentStatus: string) => {
        if (!isBrokerageAdmin) return; // Role enforcement

        setTeam(team.map(m => {
            if (m.id === id) {
                const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
                return { ...m, status: newStatus as any };
            }
            return m;
        }));
    };

    const handleDelete = (id: string) => {
        if (!isBrokerageAdmin) return; // Role enforcement
        if (confirm('Permanently remove this team member? This action wipes all role assignments.')) {
            setTeam(team.filter(m => m.id !== id));
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Role Simulator Switcher (Demo Only) */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Context Simulator:</span>
                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                    <button
                        onClick={() => setCurrentUserRole('client_admin')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${currentUserRole === 'client_admin' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}
                    >
                        Brokerage Admin
                    </button>
                    <button
                        onClick={() => setCurrentUserRole('agent')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${currentUserRole === 'agent' ? 'bg-purple-600' : 'hover:bg-white/5'}`}
                    >
                        Agent Admin
                    </button>
                </div>
                <div className="flex-1 text-right mr-4">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Tenant: </span>
                    <span className="text-[9px] font-black text-amber-500 uppercase">{currentTenantId}</span>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Enterprise Access</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900">
                        {isBrokerageAdmin ? 'Team' : 'My'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Roster</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        {isBrokerageAdmin
                            ? 'Orchestrate your brokerage. Manage agent permissions, suspension status, and role assignments.'
                            : 'Manage your professional profile and review your personal performance metrics.'}
                    </p>
                </div>
                {isBrokerageAdmin && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/10 flex items-center gap-3"
                    >
                        <svg className="w-5 h-5 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Agent
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: isBrokerageAdmin ? 'Total Agents' : 'Active Status', value: isBrokerageAdmin ? team.length : 'Verified', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Cloud Identity', value: 'OAuth 2.1', color: 'from-emerald-400 to-teal-500' },
                    { label: 'Role Authority', value: isBrokerageAdmin ? 'Full Control' : 'Profile Base', color: 'from-amber-400 to-orange-500' },
                    { label: 'Internal UID', value: isBrokerageAdmin ? 'ID-Global' : 'ID-7721', color: 'from-rose-400 to-red-600' },
                ].map((stat, i) => (
                    <div key={i} className="group p-8 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${stat.color} opacity-[0.05] -mr-8 -mt-8 rounded-full`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleTeam.map(member => (
                    <div
                        key={member.id}
                        className="group relative p-8 rounded-[48px] bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-10">
                            <div className="relative">
                                <div className={`h-20 w-20 rounded-[32px] flex items-center justify-center font-black text-2xl shadow-xl transform group-hover:rotate-6 transition-transform duration-500 ${member.role === 'client_admin'
                                    ? 'bg-slate-900 text-white border-2 border-indigo-500/20'
                                    : 'bg-slate-50 text-slate-400 border border-slate-100'
                                    }`}>
                                    {member.avatar}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white ${member.status === 'active' ? 'bg-emerald-500' : member.status === 'invited' ? 'bg-amber-400' : 'bg-red-500'}`} />
                            </div>

                            {isBrokerageAdmin && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingMember(member); setFormData({ email: member.email, name: member.name, role: member.role, templateId: member.templateId }); }}
                                        className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 mb-8">
                            <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{member.name}</h3>
                            <p className="text-xs font-bold text-slate-400">{member.email}</p>
                        </div>

                        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/50 border border-indigo-100 px-4 py-1.5 rounded-xl shrink-0">
                                {roleLabels[member.role]}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest border px-4 py-1.5 rounded-xl shrink-0 ${statusColors[member.status]}`}>
                                {member.status}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-xl shrink-0 italic">
                                🎨 {member.templateId}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100 mb-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">MLS® Listings</p>
                                <p className="text-3xl font-black text-slate-900">{member.activeListings}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Qualified Leads</p>
                                <p className="text-3xl font-black text-slate-900">{member.totalLeads}</p>
                            </div>
                        </div>

                        {isBrokerageAdmin && (
                            <div className="flex gap-3">
                                {member.status === 'active' ? (
                                    <><div className="flex flex-col gap-2 flex-1">
                                        <button
                                            onClick={() => window.location.href = `/website-builder?agentId=${member.id}`}
                                            className="w-full py-3.5 rounded-2xl bg-indigo-600 text-[10px] font-black text-white hover:bg-indigo-700 transition-all uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Website Builder
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/branding?agentId=${member.id}`}
                                            className="w-full py-3.5 rounded-2xl bg-white border border-slate-200 text-[10px] font-black text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                            </svg>
                                            Branding & Identity
                                        </button>
                                    </div><button
                                        onClick={() => handleToggleStatus(member.id, member.status)}
                                        className="px-6 rounded-2xl bg-slate-100 text-[10px] font-black text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-[0.2em]"
                                        title="Suspend Identity"
                                    >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </button></>
                                ) : (
                                    <button
                                        onClick={() => handleToggleStatus(member.id, member.status)}
                                        className="flex-1 py-4 rounded-2xl bg-emerald-50 text-[10px] font-black text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-[0.2em]"
                                    >
                                        Re-Activate Access
                                    </button>
                                )}
                            </div>
                        )}
                        {!isBrokerageAdmin && (
                            <button className="w-full py-4 rounded-2xl bg-indigo-600 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20">
                                Edit My Profile
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Invite/Edit Modal */}
            {isBrokerageAdmin && (showInviteModal || editingMember) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <form
                        onSubmit={editingMember ? ((e) => {
                            e.preventDefault();
                            setTeam(team.map(m => m.id === editingMember.id ? { ...m, ...formData, avatar: formData.name.substring(0, 2).toUpperCase() } : m));
                            setEditingMember(null);
                        }) : handleInvite}
                        className="bg-white rounded-[48px] p-12 w-full max-w-xl space-y-10 shadow-3xl animate-in zoom-in-95 duration-300 border border-slate-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">
                                    {editingMember ? 'Edit' : 'Provision'} <span className="text-indigo-600">Access</span>
                                </h3>
                                <p className="text-slate-400 font-bold mt-2">
                                    Authorized provisioning for <span className="text-indigo-600">{currentTenantId}</span>.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowInviteModal(false); setEditingMember(null); setFormData({ email: '', name: '', role: 'agent', templateId: 'agent-portfolio' }); }}
                                className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all"
                            >
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <label className="block space-y-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Legal Name</span>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Identity Point (Email)</span>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Authority Level</span>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none"
                                >
                                    <option value="agent">Standard Agent</option>
                                    <option value="client_admin">Brokerage Executive</option>
                                    <option value="viewer">Internal Auditor (Viewer)</option>
                                </select>
                            </label>

                            <label className="block space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Assigned Template</span>
                                    <a href="/templates" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 tracking-widest flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        Preview Designs
                                    </a>
                                </div>
                                <select
                                    value={formData.templateId}
                                    onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none"
                                >
                                    {authorizedTemplates.length > 0 ? (
                                        authorizedTemplates.map(tpl => (
                                            <option key={tpl.id} value={tpl.id}>
                                                {tpl.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No templates assigned to brokerage</option>
                                    )}
                                </select>
                            </label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => { setShowInviteModal(false); setEditingMember(null); setFormData({ email: '', name: '', role: 'agent', templateId: 'agent-portfolio' }); }}
                                className="flex-1 py-5 rounded-[24px] bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                className="flex-2 py-5 rounded-[24px] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20"
                            >
                                {editingMember ? 'Sync Identity' : 'Transmit Invite'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
