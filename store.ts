
import { create } from 'zustand';
import { Tenant, Doctor, ChatSession, PlanType, Message } from './types';

interface AppState {
  // Authentication / Role
  currentUser: { type: 'admin' | 'doctor' | 'patient' | 'onboarding'; id?: string; tenantId?: string } | null;
  
  // Data
  tenants: Tenant[];
  doctors: Doctor[];
  chats: ChatSession[];
  
  // Active Tenant Context (for patient landing pages)
  currentTenant: Tenant | null;

  // Actions
  setRole: (role: 'admin' | 'doctor' | 'patient' | 'onboarding', id?: string, tenantId?: string) => void;
  setCurrentTenant: (tenant: Tenant | null) => void;
  addTenant: (tenant: Tenant) => void;
  addDoctor: (doctor: Doctor) => void;
  onboardDoctor: (doctorData: Omit<Doctor, 'id' | 'tenantId' | 'isOnline'>) => void;
  toggleDoctorOnline: (doctorId: string) => void;
  createChat: (chat: ChatSession) => void;
  sendMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  completeChat: (chatId: string, notes?: string) => void;
  logout: () => void;
}

// Initial Mock Data updated with new fields
const MOCK_TENANTS: Tenant[] = [
  { id: 't1', companyName: 'City Hospital Network', planType: PlanType.ENTERPRISE, primaryColor: '#0f172a', logoUrl: 'https://picsum.photos/seed/hospital/200' },
  { id: 't2', companyName: 'Dr. Rajesh Clinic', planType: PlanType.STARTER, primaryColor: '#2563eb', logoUrl: 'https://picsum.photos/seed/clinic/200' },
];

const MOCK_DOCTORS: Doctor[] = [
  { 
    id: 'd1', 
    tenantId: 't1', 
    name: 'Dr. Sarah Smith', 
    email: 'sarah@cityhospital.com', 
    specialization: 'General Medicine', 
    licenseNumber: 'LIC12345', 
    isOnline: true,
    qualification: 'MD, Internal Medicine',
    phone: '9876543210',
    gender: 'Female',
    yob: 1985,
    experienceYears: 12,
    city: 'Mumbai',
    locality: 'Bandra',
    clinicName: 'City Hospital Main',
    consultationType: 'Hospital',
    languages: ['English', 'Hindi'],
    govId: 'AAAAA1111A',
    acceptedTerms: true
  },
  { 
    id: 'd2', 
    tenantId: 't2', 
    name: 'Dr. Rajesh Kumar', 
    email: 'rajesh@clinic.com', 
    specialization: 'Pediatrics', 
    licenseNumber: 'LIC99999', 
    isOnline: false,
    qualification: 'MBBS, DCH',
    phone: '9000000000',
    gender: 'Male',
    yob: 1978,
    experienceYears: 20,
    city: 'Delhi',
    locality: 'Saket',
    clinicName: 'Rajesh Pediatric Center',
    consultationType: 'Clinic',
    languages: ['English', 'Hindi', 'Punjabi'],
    govId: 'BBBBB2222B',
    acceptedTerms: true
  }
];

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  tenants: MOCK_TENANTS,
  doctors: MOCK_DOCTORS,
  chats: [],
  currentTenant: null,

  setRole: (type, id, tenantId) => set({ currentUser: { type, id, tenantId } }),
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  addTenant: (tenant) => set((state) => ({ tenants: [...state.tenants, tenant] })),
  addDoctor: (doctor) => set((state) => ({ doctors: [...state.doctors, doctor] })),
  
  onboardDoctor: (data) => set((state) => {
    const newId = `d-${Math.random().toString(36).substr(2, 9)}`;
    const newTenantId = `t-${Math.random().toString(36).substr(2, 9)}`;
    
    const newTenant: Tenant = {
      id: newTenantId,
      companyName: data.clinicName || `${data.name}'s Practice`,
      planType: PlanType.STARTER,
      primaryColor: '#2563eb',
      logoUrl: `https://picsum.photos/seed/${newId}/200`
    };

    const newDoctor: Doctor = {
      ...data,
      id: newId,
      tenantId: newTenantId,
      isOnline: false,
    };

    return {
      tenants: [...state.tenants, newTenant],
      doctors: [...state.doctors, newDoctor],
      currentUser: { type: 'doctor', id: newId, tenantId: newTenantId }
    };
  }),

  toggleDoctorOnline: (doctorId) => set((state) => ({
    doctors: state.doctors.map(d => d.id === doctorId ? { ...d, isOnline: !d.isOnline } : d)
  })),
  createChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  sendMessage: (chatId, msg) => set((state) => ({
    chats: state.chats.map(c => c.id === chatId ? {
      ...c,
      messages: [...c.messages, { ...msg, id: Math.random().toString(), timestamp: new Date() }]
    } : c)
  })),
  completeChat: (chatId, notes) => set((state) => ({
    chats: state.chats.map(c => c.id === chatId ? { ...c, status: 'completed', notes } : c)
  })),
  logout: () => set({ currentUser: null }),
}));
