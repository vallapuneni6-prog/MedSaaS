
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { runIntakeAnalysis } from '../services/geminiService';
import { ChatSession, PatientSession } from '../types';

const PatientView: React.FC = () => {
  const { currentTenant, doctors, createChat, sendMessage, chats, setRole } = useAppStore();
  const [step, setStep] = useState<'landing' | 'intake' | 'chat'>('landing');
  const [formData, setFormData] = useState<Partial<PatientSession>>({
    name: '',
    age: '',
    concern: '',
    language: 'English',
    phone: ''
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [messageText, setMessageText] = useState('');

  if (!currentTenant) return <div>No tenant selected</div>;

  const onlineDoctors = doctors.filter(d => d.tenantId === currentTenant.id && d.isOnline);
  const matchedDoctor = onlineDoctors[0]; // Simple matching logic

  const startIntake = () => setStep('intake');

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    
    // AI analysis of concern
    const summary = await runIntakeAnalysis(formData.concern || '');
    
    const chatId = Math.random().toString();
    const newChat: ChatSession = {
      id: chatId,
      tenantId: currentTenant.id,
      doctorId: matchedDoctor?.id || 'd1', // Fallback for demo
      patient: {
        id: Math.random().toString(),
        name: formData.name || 'Anonymous',
        age: formData.age || 'Unknown',
        concern: summary || formData.concern || '',
        language: formData.language || 'English',
        phone: formData.phone
      },
      status: 'active',
      messages: [{
        id: 'init',
        senderId: 'system',
        senderType: 'doctor', // system acting as doctor intro
        content: `Hello ${formData.name}, I have received your concern about: "${summary}". Connecting you to ${matchedDoctor?.name || 'an available doctor'} now.`,
        timestamp: new Date()
      }],
      createdAt: new Date()
    };

    createChat(newChat);
    setActiveChatId(chatId);
    
    setTimeout(() => {
      setIsMatching(false);
      setStep('chat');
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChatId) return;
    sendMessage(activeChatId, {
      senderId: 'patient',
      senderType: 'patient',
      content: messageText
    });
    setMessageText('');
  };

  const currentChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Dynamic Branding Header */}
      <div 
        className="rounded-3xl p-8 text-white mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: currentTenant.primaryColor }}
      >
        <div className="flex items-center gap-6">
          <img src={currentTenant.logoUrl} alt="Logo" className="w-20 h-20 rounded-2xl bg-white p-2 object-contain" />
          <div>
            <h1 className="text-3xl font-bold">{currentTenant.companyName}</h1>
            <p className="opacity-80">Consult with certified doctors online instantly.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
          <div className={`w-3 h-3 rounded-full animate-pulse ${onlineDoctors.length > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
          <span className="text-sm font-medium">{onlineDoctors.length} Doctors Online Now</span>
        </div>
      </div>

      {step === 'landing' && (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 leading-tight">Expert Medical Care, From Your Couch</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-600">
                <i className="fas fa-check-circle text-emerald-500"></i> No registration or account required
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <i className="fas fa-check-circle text-emerald-500"></i> Instant matching with available specialists
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <i className="fas fa-check-circle text-emerald-500"></i> Receive prescriptions via digital download
              </li>
            </ul>
            <button 
              onClick={startIntake}
              disabled={onlineDoctors.length === 0}
              className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 ${onlineDoctors.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
            >
              {onlineDoctors.length > 0 ? 'Start Consultation Now' : 'No Doctors Available'}
            </button>
          </div>
          <div className="hidden md:block">
            <img src="https://picsum.photos/seed/doc/600/400" className="rounded-3xl shadow-2xl" alt="Doctors" />
          </div>
        </div>
      )}

      {step === 'intake' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <i className="fas fa-clipboard-list text-blue-600"></i> Quick Intake Form
          </h2>
          <form onSubmit={handleIntakeSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">What is your main health concern?</label>
              <textarea required rows={4} value={formData.concern} onChange={e => setFormData({...formData, concern: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Describe your symptoms..."></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Language</label>
                <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Telugu</option>
                  <option>Tamil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone (Optional)</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isMatching}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {isMatching ? (
                <>
                  <i className="fas fa-circle-notch animate-spin"></i> Finding Best Doctor...
                </>
              ) : 'Connect with Doctor'}
            </button>
          </form>
        </div>
      )}

      {step === 'chat' && currentChat && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col h-[600px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <img src="https://picsum.photos/seed/dr/100" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="Doctor" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{matchedDoctor?.name || 'Assigned Doctor'}</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
              SESSION ACTIVE
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50">
            {currentChat.messages.map((m, idx) => (
              <div key={m.id || idx} className={`flex ${m.senderType === 'patient' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${m.senderType === 'patient' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                  <p className="text-sm">{m.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={messageText}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 px-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              />
              <button 
                onClick={handleSendMessage}
                className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientView;
