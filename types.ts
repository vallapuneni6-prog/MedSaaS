
export enum PlanType {
  STARTER = 'Starter',
  PROFESSIONAL = 'Professional',
  ENTERPRISE = 'Enterprise'
}

export interface Tenant {
  id: string;
  companyName: string;
  planType: PlanType;
  primaryColor: string;
  logoUrl: string;
  customDomain?: string;
}

export interface Doctor {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  isOnline: boolean;
  qualification: string;
  phone: string;
}

export interface Message {
  id: string;
  senderId: string; // "patient" or doctorId
  senderType: 'patient' | 'doctor';
  content: string;
  timestamp: Date;
}

export interface PatientSession {
  id: string;
  name: string;
  age: string;
  concern: string;
  language: string;
  phone?: string;
}

export interface ChatSession {
  id: string;
  tenantId: string;
  doctorId: string;
  patient: PatientSession;
  status: 'active' | 'completed' | 'cancelled';
  messages: Message[];
  notes?: string;
  createdAt: Date;
}

export interface Prescription {
  id: string;
  chatId: string;
  medicines: { name: string; dosage: string; frequency: string; duration: string }[];
  instructions: string;
  createdAt: Date;
}
