
import React from 'react';
import { useAppStore } from '../store';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <i className="fas fa-hand-holding-medical text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">MedSaaS</span>
          </div>
          
          <nav className="flex items-center gap-4">
            {currentUser ? (
              <>
                <div className="text-sm font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                  {currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1)} Mode
                </div>
                <button 
                  onClick={logout}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <span className="text-sm text-slate-500">MVP Demo</span>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          © 2025 MedSaaS Platform. Multi-tenant Medical SaaS Infrastructure.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
