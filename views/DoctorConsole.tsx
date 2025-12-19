
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { generatePrescription } from '../services/geminiService';

const DoctorConsole: React.FC = () => {
  const { currentUser, doctors, toggleDoctorOnline, chats, sendMessage, completeChat } = useAppStore();
  const doctor = doctors.find(d => d.id === currentUser?.id);
  const activeChats = chats.filter(c => c.doctorId === doctor?.id && c.status === 'active');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(activeChats[0]?.id || null);
  const [messageText, setMessageText] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<{medicines: any[], instructions: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChatId) return;
    sendMessage(selectedChatId, {
      senderId: doctor?.id || 'd1',
      senderType: 'doctor',
      content: messageText
    });
    setMessageText('');
  };

  const handlePrescriptionClick = async () => {
    if (!selectedChat) return;
    setShowPrescriptionModal(true);
    setIsGenerating(true);
    try {
      const data = await generatePrescription(selectedChat.patient.concern, "Simulated doctor analysis");
      setPrescriptionData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!doctor) return <div>Doctor not found</div>;

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-160px)]">
      {/* Sidebar: Status & Incoming List */}
      <div className="col-span-12 md:col-span-3 flex flex-col gap-6 h-full">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">{doctor.name}</h3>
              <p className="text-xs text-slate-500">{doctor.specialization}</p>
            </div>
          </div>
          <button 
            onClick={() => toggleDoctorOnline(doctor.id)}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${doctor.isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
          >
            <div className={`w-2 h-2 rounded-full ${doctor.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
            {doctor.isOnline ? 'You are ONLINE' : 'You are OFFLINE'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{activeChats.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-800">12</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Today</div>
          </div>
        </div>

        {/* Chats List */}
        <div className="bg-white flex-1 rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h4 className="font-bold text-sm text-slate-700">Active Consultations</h4>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeChats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No active chats</div>
            ) : (
              activeChats.map(c => (
                <button 
                  key={c.id}
                  onClick={() => setSelectedChatId(c.id)}
                  className={`w-full p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${selectedChatId === c.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''}`}
                >
                  <div className="font-bold text-slate-800">{c.patient.name}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{c.patient.concern}</div>
                  <div className="text-[10px] text-slate-400 mt-2 uppercase font-medium">{c.patient.age}y • {c.patient.language}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="col-span-12 md:col-span-9 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {selectedChat.patient.name} <span className="text-xs font-normal text-slate-400">({selectedChat.patient.age} years)</span>
                </h3>
                <p className="text-xs text-blue-600 font-medium">Concern: {selectedChat.patient.concern}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrescriptionClick}
                  className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-file-prescription"></i> Prescription
                </button>
                <button 
                  onClick={() => {
                    completeChat(selectedChat.id);
                    setSelectedChatId(null);
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {selectedChat.messages.map((m, idx) => (
                <div key={m.id || idx} className={`flex ${m.senderType === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${m.senderType === 'doctor' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                    <p className="text-sm">{m.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={messageText}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type advice or follow-up question..." 
                  className="flex-1 px-4 py-3 bg-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  className="px-6 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-100"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 text-slate-400 text-3xl">
              <i className="fas fa-comments"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Patient Chat Queue</h3>
            <p className="text-slate-500 max-w-sm">Select an active session from the sidebar to begin consulting.</p>
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Generate Digital Prescription</h2>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-8">
              {isGenerating ? (
                <div className="text-center py-12 space-y-4">
                  <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-medium">AI is generating prescription based on diagnosis...</p>
                </div>
              ) : prescriptionData ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Medicines</h4>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <th className="pb-3">Drug Name</th>
                          <th className="pb-3">Dosage</th>
                          <th className="pb-3">Frequency</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {prescriptionData.medicines.map((m, i) => (
                          <tr key={i} className="border-t border-slate-200/50">
                            <td className="py-3 font-semibold text-slate-700">{m.name}</td>
                            <td className="py-3 text-slate-600">{m.dosage}</td>
                            <td className="py-3 text-slate-600">{m.frequency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-800">Additional Instructions</h4>
                    <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100 italic">
                      "{prescriptionData.instructions}"
                    </p>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                      <i className="fas fa-file-pdf mr-2"></i> Save & Send to Patient
                    </button>
                    <button onClick={() => setShowPrescriptionModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorConsole;
