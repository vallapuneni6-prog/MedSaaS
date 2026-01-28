
import React from 'react';
import { useAppStore } from '../store';
import { PlanType } from '../types';

const HomeView: React.FC = () => {
  const { tenants, setRole, setCurrentTenant } = useAppStore();

  return (
    <div className="space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
          Healthcare OS v1.0
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 md:text-5xl leading-tight">
          Next-Gen Medical <span className="text-blue-600">SaaS Ecosystem</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          One platform for Hospitals, Clinics, and Independent Practitioners. Select an interface to explore.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Super Admin Entry */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Platform Admin</h2>
          <p className="text-slate-500 text-sm mb-6">Manage tenants, subscription billing, and multi-hospital revenue analytics.</p>
          <button 
            onClick={() => setRole('admin')}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Super-Admin Console
          </button>
        </div>

        {/* Doctor Entry */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
            <i className="fas fa-user-md text-xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Doctor Console</h2>
          <p className="text-slate-500 text-sm mb-6">Demo Dr. Sarah's dashboard. Handle chats and digital prescriptions.</p>
          <button 
            onClick={() => setRole('doctor', 'd1', 't1')}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Enter Workspace
          </button>
        </div>

        {/* Provider Enrollment (NEW) */}
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
            <i className="fas fa-plus-circle text-xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-2 text-emerald-900">Join Platform</h2>
          <p className="text-emerald-700 text-sm mb-6">New practitioner? Enroll now to create your own digital clinic instantly.</p>
          <button 
            onClick={() => setRole('onboarding')}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Enroll as Doctor
          </button>
        </div>

        {/* Tenant View Entry */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-slate-900 group-hover:scale-110 transition-transform">
            <i className="fas fa-hospital text-xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Patient Side</h2>
          <p className="text-slate-500 text-sm mb-6">View branded hospital portals and the patient intake experience.</p>
          <div className="space-y-2">
            {tenants.map(t => (
              <button 
                key={t.id}
                onClick={() => {
                  setCurrentTenant(t);
                  setRole('patient');
                }}
                className="w-full text-left px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <span>{t.companyName}</span>
                <i className="fas fa-chevron-right text-[10px] text-slate-400"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
        <i className="fas fa-info-circle text-blue-600 mt-1"></i>
        <div>
          <h4 className="font-bold text-blue-900">Architecture Insight</h4>
          <p className="text-blue-800 text-sm leading-relaxed">
            Every "Tenant" in MedSaaS operates in its own isolated logic silo. Branding, doctor rosters, and patient records are logically partitioned 
            by <code>tenantId</code>, ensuring strict HIPAA-level data boundaries even in a shared database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
