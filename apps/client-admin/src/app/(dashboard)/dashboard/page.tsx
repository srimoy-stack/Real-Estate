'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

const allChartData = [
  { day: 'Feb 5', leads: 28, inquiries: 11 },
  { day: 'Feb 6', leads: 35, inquiries: 16 },
  { day: 'Feb 7', leads: 42, inquiries: 19 },
  { day: 'Feb 8', leads: 20, inquiries: 8 },
  { day: 'Feb 9', leads: 15, inquiries: 6 },
  { day: 'Feb 10', leads: 38, inquiries: 17 },
  { day: 'Feb 11', leads: 44, inquiries: 21 },
  { day: 'Feb 12', leads: 50, inquiries: 24 },
  { day: 'Feb 13', leads: 46, inquiries: 20 },
  { day: 'Feb 14', leads: 33, inquiries: 14 },
  { day: 'Feb 15', leads: 18, inquiries: 7 },
  { day: 'Feb 16', leads: 12, inquiries: 5 },
  { day: 'Feb 17', leads: 52, inquiries: 26 },
  { day: 'Feb 18', leads: 60, inquiries: 30 },
  { day: 'Feb 19', leads: 32, inquiries: 14 },
  { day: 'Feb 20', leads: 48, inquiries: 22 },
  { day: 'Feb 21', leads: 41, inquiries: 18 },
  { day: 'Feb 22', leads: 55, inquiries: 28 },
  { day: 'Feb 23', leads: 38, inquiries: 15 },
  { day: 'Feb 24', leads: 22, inquiries: 9 },
  { day: 'Feb 25', leads: 18, inquiries: 7 },
  { day: 'Feb 26', leads: 62, inquiries: 31 },
  { day: 'Feb 27', leads: 74, inquiries: 35 },
  { day: 'Feb 28', leads: 58, inquiries: 24 },
  { day: 'Mar 1', leads: 85, inquiries: 42 },
  { day: 'Mar 2', leads: 92, inquiries: 48 },
  { day: 'Mar 3', leads: 78, inquiries: 38 },
  { day: 'Mar 4', leads: 67, inquiries: 29 },
];

const recentLeads = [
  { name: 'Alice Thompson', time: '2 mins ago', property: 'Glass Pavilion', status: 'hot' as const, price: '$2.4M' },
  { name: 'Mark Ruffalo', time: '1 hour ago', property: 'Skyline Penthouse', status: 'warm' as const, price: '$4.1M' },
  { name: 'Sarah Jenkins', time: '3 hours ago', property: 'Elysian Shore', status: 'hot' as const, price: '$1.8M' },
  { name: 'David Miller', time: 'Yesterday', property: 'The Meridian', status: 'cold' as const, price: '$890K' },
  { name: 'Emily Chen', time: 'Yesterday', property: 'Harbor View Lofts', status: 'warm' as const, price: '$1.2M' },
  { name: 'Robert Wilson', time: '2 days ago', property: 'Oakwood Estates', status: 'cold' as const, price: '$3.5M' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<'7' | '14' | '30'>('14');
  const [isGenerating, setIsGenerating] = useState(false);

  const chartData = useMemo(() => {
    const count = Number(timePeriod);
    return allChartData.slice(-count);
  }, [timePeriod]);

  const summaryStats = useMemo(() => {
    const totalLeads = chartData.reduce((s, d) => s + d.leads, 0);
    const totalInquiries = chartData.reduce((s, d) => s + d.inquiries, 0);
    const convRate = totalLeads > 0 ? ((totalInquiries / totalLeads) * 100).toFixed(1) : '0';
    return { totalLeads, totalInquiries, convRate };
  }, [chartData]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const csvRows = [
        ['Date', 'Leads', 'Inquiries'],
        ...chartData.map(d => [d.day, String(d.leads), String(d.inquiries)]),
        [],
        ['Total Leads', String(summaryStats.totalLeads), ''],
        ['Total Inquiries', '', String(summaryStats.totalInquiries)],
        ['Conversion Rate', `${summaryStats.convRate}%`, ''],
      ];
      const csv = csvRows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 800);
  };

  const metrics = [
    { label: 'Active Listings', value: '48', trend: '+12%', icon: '🏠', href: '/listings-settings' },
    { label: 'Total Leads', value: '1,280', trend: '+24%', icon: '👥', href: '/leads' },
    { label: 'Inquiries (24h)', value: '12', trend: '+5%', icon: '📨', href: '/leads' },
    { label: 'Team Members', value: '24', trend: '0%', icon: '👔', href: '/team' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 bg-indigo-600 rounded-full" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Overview</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            Operational <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Console</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl font-medium">
            Welcome back. Here&apos;s what&apos;s happening across your real estate portfolio today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Generating…
              </>
            ) : 'Generate Report'}
          </button>
          <button
            onClick={() => router.push('/listings-settings' as Route)}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            Add Listing
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((stat, i) => (
          <div
            key={i}
            onClick={() => router.push(stat.href as Route)}
            className="group p-6 rounded-3xl bg-white shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md bg-slate-100 ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Second Row: Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Flow Chart */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Lead Acquisition Flow</h3>
              <p className="text-xs text-slate-500 mt-1">New leads &amp; inquiries per day</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 mr-4">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-indigo-600 to-purple-500" /> Leads
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-amber-400 to-orange-400" /> Inquiries
                </span>
              </div>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as '7' | '14' | '30')}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Chart with dual series */}
          <div className="mt-6 relative" style={{ height: '260px' }}>
            {/* Y-axis grid lines */}
            {[0, 25, 50, 75, 100].map(v => (
              <div key={v} className="absolute left-0 right-0 flex items-center" style={{ bottom: `${v}%` }}>
                <span className="text-[9px] text-slate-300 font-bold w-6 text-right mr-2">{v}</span>
                <div className="flex-1 border-t border-dashed border-slate-100" />
              </div>
            ))}

            <div className="flex items-end gap-2 h-full pl-8">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 group relative flex flex-col items-center">
                  {/* Tooltip */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 whitespace-nowrap shadow-xl">
                    <p>{d.day}</p>
                    <p className="text-indigo-300">{d.leads} leads</p>
                    <p className="text-amber-300">{d.inquiries} inquiries</p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                  </div>
                  <div className="flex gap-px items-end w-full" style={{ height: '230px' }}>
                    <div
                      className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-md group-hover:from-indigo-500 group-hover:to-purple-400 transition-all duration-500 min-w-[8px]"
                      style={{ height: `${(d.leads / 100) * 230}px` }}
                    />
                    <div
                      className="flex-1 bg-gradient-to-t from-amber-400 to-orange-400 rounded-t-md group-hover:from-amber-300 group-hover:to-orange-300 transition-all duration-500 min-w-[8px]"
                      style={{ height: `${(d.inquiries / 100) * 230}px` }}
                    />
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 text-center mt-2 truncate w-full">{d.day}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            {[
              { label: 'Total Leads', value: summaryStats.totalLeads.toLocaleString(), change: '+18%', positive: true },
              { label: 'Total Inquiries', value: summaryStats.totalInquiries.toLocaleString(), change: '+22%', positive: true },
              { label: 'Conversion Rate', value: `${summaryStats.convRate}%`, change: '+3.2%', positive: true },
              { label: 'Avg. Response Time', value: '2.4h', change: '-12%', positive: true },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-lg font-black text-slate-900 mt-1">{s.value}</p>
                <p className={`text-[10px] font-bold mt-0.5 ${s.positive ? 'text-emerald-500' : 'text-red-500'}`}>{s.change}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads Activity */}
        <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recent Leads</h3>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">12 New</span>
          </div>
          <div className="space-y-5">
            {recentLeads.map((lead, i) => (
              <div
                key={i}
                onClick={() => router.push('/leads' as Route)}
                className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50 -mx-3 px-3 py-2 rounded-xl transition-colors"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                  ${lead.status === 'hot' ? 'bg-red-50 text-red-600' : lead.status === 'warm' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{lead.name}</p>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0
                      ${lead.status === 'hot' ? 'bg-red-500/10 text-red-500' : lead.status === 'warm' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{lead.property} · {lead.price}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 shrink-0">{lead.time}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/leads' as Route)}
            className="w-full mt-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-all uppercase tracking-widest"
          >
            View All Leads
          </button>
        </div>
      </div>
    </div>
  );
}
