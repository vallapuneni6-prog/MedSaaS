
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { runIntakeAnalysis } from '../services/geminiService';
import { ChatSession, PatientSession } from '../types';

const PATIENT_CONDITIONS = [
  { 
    id: 1,
    title: "1. Nature of the Platform", 
    text: "SureHealth24x7 is a doctor discovery and patient engagement platform. It is NOT a telemedicine service and does NOT provide online medical consultation. The platform only helps you find doctors, clinics, and hospitals, share basic symptoms, and request appointments." 
  },
  { 
    id: 2,
    title: "2. No Online Consultation or Prescription", 
    text: "Doctors on SureHealth24x7 will NOT diagnose your condition online or prescribe medicines through chat. Medical advice, diagnosis, and treatment can be given only after physical examination at the clinic or hospital. Chat is meant only to understand your concern and guide you to visit the doctor." 
  },
  { 
    id: 3,
    title: "3. Not for Emergencies", 
    text: "⚠️ Important Emergency Notice: SureHealth24x7 is NOT for medical emergencies. If you have severe pain, chest pain, breathing difficulty, heavy bleeding, loss of consciousness, or any life-threatening condition, please go to the nearest hospital or call emergency services immediately. Do NOT rely on this platform during emergencies.",
    isEmergency: true
  },
  { 
    id: 4,
    title: "4. Doctor–Patient Relationship", 
    text: "Communication on SureHealth24x7 does not create a doctor–patient relationship. A formal doctor–patient relationship starts only when you visit the doctor in person. All medical decisions are made by the doctor during physical consultation, not on this platform." 
  },
  { 
    id: 5,
    title: "5. Information Accuracy", 
    text: "I agree that I will provide true and correct information about my symptoms. I understand that incomplete or incorrect information may affect guidance given by the doctor. SureHealth24x7 is not responsible for outcomes due to incorrect information provided by patients." 
  },
  { 
    id: 6,
    title: "6. Privacy & Data Use", 
    text: "I understand that my information is shared only with the selected doctor or clinic and is used only for healthcare communication purposes. SureHealth24x7 follows applicable data protection and privacy laws." 
  },
  { 
    id: 7,
    title: "7. Platform Limitation of Liability", 
    text: "SureHealth24x7 is a technology platform only and is not responsible for medical advice, treatment outcomes, or doctor conduct. All medical care is provided solely by the healthcare provider." 
  },
  { 
    id: 8,
    title: "8. Acceptance", 
    text: "I confirm that I have read and understood this disclaimer, understand that this platform is not a substitute for medical consultation, and accept responsibility to visit a doctor for proper diagnosis and treatment." 
  }
];

const PatientView: React.FC = () => {
  const { currentTenant, doctors, createChat, sendMessage, chats } = useAppStore();
  const [step, setStep] = useState<'landing' | 'disclaimer' | 'intake' | 'chat'>('landing');
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
  
  // Track acceptance of individual conditions
  const [acceptedConditions, setAcceptedConditions] = useState<boolean[]>(new Array(PATIENT_CONDITIONS.length).fill(false));
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);

  if (!currentTenant) return <div className="p-12 text-center text-slate-500 font-bold">No clinic context selected. Please return home.</div>;

  const onlineDoctors = doctors.filter(d => d.tenantId === currentTenant.id && d.isOnline);
  const matchedDoctor = onlineDoctors[0];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setHasReadToBottom(true);
    }
  };

  const toggleCondition = (index: number) => {
    const newAccepted = [...acceptedConditions];
    newAccepted[index] = !newAccepted[index];
    setAcceptedConditions(newAccepted);
  };

  const allConditionsAccepted = acceptedConditions.every(c => c === true);

  const handleDisclaimerProceed = () => {
    if (allConditionsAccepted && hasReadToBottom) {
      const now = new Date();
      const timestamp = `${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
      setAcceptedAt(timestamp);
      setStep('intake');
    }
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);
    
    const summary = await runIntakeAnalysis(formData.concern || '');
    
    const chatId = Math.random().toString(36).substring(7);
    const newChat: ChatSession = {
      id: chatId,
      tenantId: currentTenant.id,
      doctorId: matchedDoctor?.id || 'd1',
      patient: {
        id: Math.random().toString(36).substring(7),
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
        senderType: 'doctor',
        content: `Hello ${formData.name}, I'm the duty doctor. I have received your symptoms: "${summary}". [CONSENT LOGGED: ${acceptedAt}]. Note: This is guidance only, physical visit mandatory.`,
        timestamp: new Date()
      }],
      createdAt: new Date()
    };

    createChat(newChat);
    setActiveChatId(chatId);
    
    setTimeout(() => {
      setIsMatching(false);
      setStep('chat');
    }, 1500);
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
      {/* Branded Header */}
      <div 
        className="rounded-3xl p-8 text-white mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500"
        style={{ backgroundColor: currentTenant.primaryColor }}
      >
        <div className="flex items-center gap-6">
          <img src={currentTenant.logoUrl} alt="Logo" className="w-20 h-20 rounded-2xl bg-white p-2 object-contain shadow-lg" />
          <div>
            <h1 className="text-3xl font-black">{currentTenant.companyName}</h1>
            <p className="opacity-80 font-medium">Healthcare Engagement Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
          <div className={`w-3 h-3 rounded-full animate-pulse ${onlineDoctors.length > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
          <span className="text-sm font-black uppercase tracking-widest">{onlineDoctors.length} Doctors Active</span>
        </div>
      </div>

      {step === 'landing' && (
        <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-slate-800 leading-tight">Patient Discovery <br/><span className="text-blue-600">& Engagement.</span></h2>
            <p className="text-slate-500 font-medium leading-relaxed">SureHealth24x7 is your digital gateway to professional medical guidance. Share your symptoms and find the right specialist for a physical visit.</p>
            <button 
              onClick={() => setStep('disclaimer')}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              Consult for Guidance
              <i className="fas fa-arrow-right"></i>
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">Legal consent required for security</p>
          </div>
          <div className="hidden md:block">
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600" className="rounded-[40px] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 border-8 border-white" alt="Medical" />
          </div>
        </div>
      )}

      {step === 'disclaimer' && (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Legal Terms & Consent</h2>
            {!hasReadToBottom && (
              <span className="text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full font-black animate-pulse uppercase tracking-widest">
                Scroll to Activate
              </span>
            )}
          </div>
          
          <div 
            onScroll={handleScroll}
            className="p-8 h-[450px] overflow-y-auto space-y-4"
          >
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <p className="text-[11px] font-bold text-blue-800 leading-relaxed text-center">
                Please review and check EVERY box below to proceed. You must scroll to the end of this list.
              </p>
            </div>

            {PATIENT_CONDITIONS.map((condition, idx) => (
              <div 
                key={condition.id}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  acceptedConditions[idx] 
                  ? (condition.isEmergency ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-200') 
                  : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'
                }`}
                onClick={() => toggleCondition(idx)}
              >
                <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-colors shrink-0 ${
                  acceptedConditions[idx] 
                  ? (condition.isEmergency ? 'bg-red-600 border-red-600 text-white' : 'bg-emerald-500 border-emerald-500 text-white') 
                  : 'bg-white border-slate-300 shadow-inner'
                }`}>
                  {acceptedConditions[idx] && <i className="fas fa-check text-xs"></i>}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xs font-black uppercase tracking-wider mb-2 ${
                    condition.isEmergency ? 'text-red-700' : (acceptedConditions[idx] ? 'text-emerald-800' : 'text-slate-800')
                  }`}>
                    {condition.title}
                  </h4>
                  <p className={`text-[11px] leading-relaxed font-bold ${
                    condition.isEmergency ? 'text-red-600' : (acceptedConditions[idx] ? 'text-emerald-700' : 'text-slate-500')
                  }`}>
                    {condition.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 border-t border-slate-100 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consents Required</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${allConditionsAccepted ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                {acceptedConditions.filter(c => c).length} / {PATIENT_CONDITIONS.length} CHECKED
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => setStep('landing')} 
                className="text-sm font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex flex-col items-end gap-2">
                <button 
                  onClick={handleDisclaimerProceed}
                  disabled={!allConditionsAccepted || !hasReadToBottom}
                  className={`px-12 py-4 rounded-2xl font-black text-white shadow-xl transition-all ${
                    allConditionsAccepted && hasReadToBottom 
                    ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105' 
                    : 'bg-slate-300 cursor-not-allowed opacity-70 grayscale'
                  }`}
                >
                  Accept & Continue
                </button>
                {!hasReadToBottom && (
                  <p className="text-[9px] text-blue-500 font-bold italic animate-bounce">
                    <i className="fas fa-arrow-down mr-1"></i> Scroll to very bottom area to enable
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'intake' && (
        <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
          {/* LEGAL TIMESTAMP BADGE */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                <i className="fas fa-check"></i>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Legal Consent Verified</p>
                <p className="text-[9px] font-bold opacity-70 mt-1">Acceptance Log: {acceptedAt}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-notes-medical text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Symptom Intake</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Brief details for guidance</p>
            </div>
          </div>
          
          <form onSubmit={handleIntakeSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 bg-slate-50" placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age *</label>
                <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 bg-slate-50" placeholder="Years" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Health Concern *</label>
              <textarea required rows={4} value={formData.concern} onChange={e => setFormData({...formData, concern: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-bold text-slate-700 bg-slate-50" placeholder="Briefly describe symptoms..."></textarea>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Language</label>
                <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none font-bold text-slate-700">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Telugu</option>
                  <option>Tamil</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact (Optional)</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 bg-slate-50" placeholder="Mobile" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isMatching}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl"
            >
              {isMatching ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i> Analyzing...
                </>
              ) : (
                <>
                  Connect for Guidance
                  <i className="fas fa-comment-medical"></i>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {step === 'chat' && currentChat && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl flex flex-col h-[750px] overflow-hidden animate-in fade-in duration-500">
          {/* Chat Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 border-4 border-white flex items-center justify-center text-white font-black text-2xl shadow-xl">
              {matchedDoctor?.name?.[4] || 'D'}
            </div>
            <div className="flex-1">
              <h3 className="font-black text-slate-800 text-xl leading-tight">{matchedDoctor?.name || 'Practitioner'}</h3>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Connection</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="px-4 py-2 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-500 shadow-lg shadow-blue-100">
                Guidance Channel
              </div>
              {/* STICKY LEGAL TIMESTAMP IN CHAT */}
              <div className="flex items-center gap-1.5 opacity-50">
                <i className="fas fa-shield-check text-[10px]"></i>
                <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">Consent Log: {acceptedAt}</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30">
            {currentChat.messages.map((m, idx) => (
              <div key={m.id || idx} className={`flex ${m.senderType === 'patient' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-6 py-4 rounded-[32px] shadow-lg relative ${
                  m.senderType === 'patient' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none border-b-4'
                }`}>
                  <p className="text-sm font-bold leading-relaxed">{m.content}</p>
                  <span className={`text-[8px] mt-2 block font-black uppercase tracking-widest ${m.senderType === 'patient' ? 'opacity-60' : 'text-slate-400'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-8 border-t border-slate-100 bg-white">
            <div className="flex gap-4">
              <input 
                type="text" 
                value={messageText}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Ask for clarification..." 
                className="flex-1 px-8 py-5 bg-slate-100 border-none rounded-[24px] focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold placeholder:text-slate-400 transition-all shadow-inner"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 active:scale-95 disabled:opacity-50"
              >
                <i className="fas fa-paper-plane text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientView;
