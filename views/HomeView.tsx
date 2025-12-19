
import React from 'react';
import { useAppStore } from '../store';
import { PlanType } from '../types';

const HomeView: React.FC = () => {
  const { tenants, setRole, setCurrentTenant } = useAppStore();

  return (
    <div className="space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 md:text-5xl">
          Healthcare Mediator <span className="text-blue-600">SaaS Platform</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Multi-tenant infrastructure for doctor consultations. Choose your entry point for the demo below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Super Admin Entry */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Platform Admin</h2>
          <p className="text-slate-500 text-sm mb-6">Manage tenants, subscriptions, and platform-wide revenue analytics.</p>
          <button 
            onClick={() => setRole('admin')}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Access Super-Admin
          </button>
        </div>

        {/* Doctor Entry */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
            <i className="fas fa-user-md text-xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Doctor Console</h2>
          <p className="text-slate-500 text-sm mb-6">Handle incoming patient chats, go online/offline, and generate prescriptions.</p>
          <button 
            onClick={() => setRole('doctor', 'd1', 't1')}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Access Dr. Sarah (t1)
          </button>
        </div>

        {/* Tenant View Entry */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
            <i className="fas fa-hospital text-xl"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Patient Experience</h2>
          <p className="text-slate-500 text-sm mb-6">Select a tenant to view their custom-branded patient landing page.</p>
          <div className="space-y-2">
            {tenants.map(t => (
              <button 
                key={t.id}
                onClick={() => {
                  setCurrentTenant(t);
                  setRole('patient');
                }}
                className="w-full text-left px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <span>{t.companyName}</span>
                <i className="fas fa-chevron-right text-[10px] text-slate-400"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
        <i className="fas fa-info-circle text-blue-600 mt-1"></i>
        <div>
          <h4 className="font-bold text-blue-900">Multi-Tenancy Note</h4>
          <p className="text-blue-800 text-sm leading-relaxed">
            In a production environment, each tenant would have their own subdomain (e.g., <code>rajesh.medsaas.com</code>). 
            This demo uses state to isolate data and branding between "City Hospital" and "Dr. Rajesh Clinic".
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
