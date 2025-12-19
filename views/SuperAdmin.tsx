
import React from 'react';
import { useAppStore } from '../store';
import { PlanType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const MOCK_ANALYTICS = [
  { name: 'Jan', revenue: 4000, consultations: 240 },
  { name: 'Feb', revenue: 3000, consultations: 198 },
  { name: 'Mar', revenue: 5000, consultations: 300 },
  { name: 'Apr', revenue: 2780, consultations: 150 },
  { name: 'May', revenue: 1890, consultations: 100 },
  { name: 'Jun', revenue: 2390, consultations: 120 },
];

const SuperAdmin: React.FC = () => {
  const { tenants } = useAppStore();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-slate-500">Managing {tenants.length} active tenants</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <i className="fas fa-plus"></i> Onboard New Tenant
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total MRR', value: '₹1,24,900', icon: 'fa-money-bill-wave', color: 'bg-emerald-500' },
          { label: 'Platform Comm.', value: '₹34,000', icon: 'fa-percentage', color: 'bg-blue-500' },
          { label: 'Active Doctors', value: '42', icon: 'fa-user-md', color: 'bg-indigo-500' },
          { label: 'Uptime', value: '99.98%', icon: 'fa-server', color: 'bg-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Revenue Growth</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ANALYTICS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Consultation Trends</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_ANALYTICS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="consultations" stroke="#8b5cf6" strokeWidth={3} dot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tenant Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Active Tenants</h3>
          <div className="flex gap-2">
            <input placeholder="Search tenants..." className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Tenant Name</th>
                <th className="px-6 py-4">Plan Type</th>
                <th className="px-6 py-4">Commission</th>
                <th className="px-6 py-4">MRR</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={t.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-slate-800">{t.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.planType === PlanType.ENTERPRISE ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                      {t.planType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t.planType === PlanType.ENTERPRISE ? '15%' : t.planType === PlanType.PROFESSIONAL ? '20%' : '25%'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {t.planType === PlanType.ENTERPRISE ? 'Custom' : t.planType === PlanType.PROFESSIONAL ? '₹7,999' : '₹2,999'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-slate-400 hover:text-blue-600"><i className="fas fa-edit"></i></button>
                    <button className="text-slate-400 hover:text-red-600"><i className="fas fa-pause"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
