
import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { Doctor, ConsultationType } from '../types';

const MANDATORY_CONDITIONS = [
  { title: "1. Platform Nature & Scope", text: "I understand that SureHealth24x7 is a discovery platform, NOT a telemedicine provider, and does not provide online consultations." },
  { title: "2. No Online Diagnosis or Treatment", text: "I will NOT provide medical diagnosis or prescriptions through chat. Final medical advice is given only after physical examination." },
  { title: "3. Doctor Responsibility", text: "I am a registered medical practitioner in India. All credentials provided are true and I am solely responsible for patient care." },
  { title: "4. Patient Chat Disclaimer", text: "Patient chats are for understanding symptoms only. I will advise patients to visit the clinic for proper examination." },
  { title: "5. Emergency Disclaimer", text: "I acknowledge SureHealth24x7 is NOT for emergencies. I will advise patients to seek immediate hospital care for emergencies." },
  { title: "6. Data Usage & Privacy", text: "I will protect patient data, comply with privacy laws, and use shared information only for medical communication purposes." },
  { title: "7. Platform Liability Limitation", text: "SureHealth24x7 is a technology provider and is not liable for medical outcomes or doctor-patient disputes." },
  { title: "8. Subscription & Account Usage", text: "Fees are for platform visibility, not outcomes. Misuse of the platform may result in account termination." },
  { title: "9. Compliance with Laws", text: "I agree to comply with MCI / NMC guidelines and all applicable Indian healthcare laws." },
  { title: "10. Acceptance of Responsibility", text: "I have read all terms and accept full professional and legal responsibility for my medical practice on this platform." }
];

const DoctorOnboardingView: React.FC = () => {
  const { onboardDoctor } = useAppStore();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for the 10 mandatory disclaimer conditions
  const [acceptedConditions, setAcceptedConditions] = useState<boolean[]>(new Array(MANDATORY_CONDITIONS.length).fill(false));
  
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    licenseNumber: '',
    gender: 'Male',
    yob: 1990,
    experienceYears: 1,
    city: '',
    locality: '',
    clinicName: '',
    consultationType: 'Clinic',
    languages: ['English'],
    govId: '',
    acceptedTerms: false,
    profilePhotoUrl: ''
  });

  const updateField = (field: keyof Doctor, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCondition = (index: number) => {
    const newConditions = [...acceptedConditions];
    newConditions[index] = !newConditions[index];
    setAcceptedConditions(newConditions);
    
    const allChecked = newConditions.every(c => c === true);
    updateField('acceptedTerms', allChecked);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('profilePhotoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleLanguageToggle = (lang: string) => {
    const current = formData.languages || [];
    if (current.includes(lang)) {
      updateField('languages', current.filter(l => l !== lang));
    } else {
      updateField('languages', [...current, lang]);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return !!(
        formData.name?.trim() && 
        formData.email?.trim() && 
        formData.phone?.trim() && 
        formData.licenseNumber?.trim() && 
        formData.specialization?.trim() && 
        formData.qualification?.trim() &&
        formData.profilePhotoUrl
      );
    }
    if (step === 2) {
      return !!(
        formData.city?.trim() && 
        formData.locality?.trim() && 
        formData.clinicName?.trim()
      );
    }
    if (step === 3) {
      const govIdValid = !!formData.govId?.trim();
      const allConditionsAccepted = acceptedConditions.every(c => c === true);
      return govIdValid && allConditionsAccepted;
    }
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid()) {
      if (step === 3) {
        onboardDoctor(formData as Omit<Doctor, 'id' | 'tenantId' | 'isOnline'>);
      } else {
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const acceptedCount = acceptedConditions.filter(c => c).length;
  const allConditionsAccepted = acceptedCount === MANDATORY_CONDITIONS.length;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header & Progress */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Doctor Enrollment</h1>
              <p className="text-slate-400 text-sm">Join SureHealth24x7 and connect with patients in your area.</p>
            </div>
            <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold border border-blue-600/30">
              STEP {step} OF 3
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= i ? 'bg-blue-600' : 'bg-slate-700 text-slate-500'}`}>
                  {i}
                </div>
                {i < 3 && <div className={`w-12 h-0.5 rounded ${step > i ? 'bg-blue-600' : 'bg-slate-700'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-id-card text-blue-600"></i> Identity & Credentials
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors cursor-pointer group" onClick={triggerFileUpload}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                  />
                  {formData.profilePhotoUrl ? (
                    <div className="relative">
                      <img src={formData.profilePhotoUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                      <div className="absolute bottom-0 right-0 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white">
                        <i className="fas fa-camera text-[10px]"></i>
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-2xl group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <p className="text-sm font-bold text-slate-700">{formData.profilePhotoUrl ? 'Change Profile Photo' : 'Upload Profile Photo *'}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">JPG, PNG (MAX 2MB)</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Full Name *</label>
                  <input 
                    required 
                    value={formData.name} 
                    onChange={e => updateField('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. Dr. Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Email Address *</label>
                  <input 
                    required 
                    type="email"
                    value={formData.email} 
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="jane.doe@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Phone Number *</label>
                  <input 
                    required 
                    type="tel"
                    value={formData.phone} 
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Gender</label>
                  <div className="flex gap-4">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => updateField('gender', g)}
                        className={`flex-1 py-2 rounded-xl border font-medium text-sm transition-all ${formData.gender === g ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-slate-200 text-slate-500'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Year of Birth</label>
                  <input 
                    type="number"
                    value={formData.yob} 
                    onChange={e => updateField('yob', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Primary Qualification *</label>
                  <input 
                    required
                    placeholder="e.g. MBBS, MD"
                    value={formData.qualification} 
                    onChange={e => updateField('qualification', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Specialization *</label>
                  <input 
                    required
                    placeholder="e.g. Cardiologist"
                    value={formData.specialization} 
                    onChange={e => updateField('specialization', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Medical Reg. Number *</label>
                  <input 
                    required
                    placeholder="e.g. State Council #12345"
                    value={formData.licenseNumber} 
                    onChange={e => updateField('licenseNumber', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-hospital-alt text-blue-600"></i> Practice Basics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">City *</label>
                  <input 
                    required 
                    value={formData.city} 
                    onChange={e => updateField('city', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Area / Locality *</label>
                  <input 
                    required 
                    value={formData.locality} 
                    onChange={e => updateField('locality', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Clinic / Hospital Name *</label>
                  <input 
                    required 
                    value={formData.clinicName} 
                    onChange={e => updateField('clinicName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Consultation Type</label>
                  <select 
                    value={formData.consultationType} 
                    onChange={e => updateField('consultationType', e.target.value as ConsultationType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="OPD">OPD Center</option>
                    <option value="Clinic">Private Clinic</option>
                    <option value="Hospital">Multi-specialty Hospital</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam'].map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${formData.languages?.includes(lang) ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-shield-check text-blue-600"></i> Trust & Compliance
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex justify-between">
                    <span>Government ID (Aadhaar / PAN) *</span>
                    {formData.govId?.trim() ? (
                      <span className="text-emerald-500 text-[10px] uppercase font-bold"><i className="fas fa-check-circle mr-1"></i> Added</span>
                    ) : (
                      <span className="text-red-400 text-[10px] uppercase font-bold">Required</span>
                    )}
                  </label>
                  <input 
                    required 
                    value={formData.govId} 
                    onChange={e => updateField('govId', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${formData.govId?.trim() ? 'border-emerald-200 focus:ring-emerald-500' : 'border-slate-200 focus:ring-blue-500'}`} 
                    placeholder="Enter ID number"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Mandatory Disclaimers</h3>
                    <div className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${allConditionsAccepted ? 'bg-emerald-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
                      {acceptedCount}/{MANDATORY_CONDITIONS.length} ACCEPTED
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {MANDATORY_CONDITIONS.map((condition, idx) => (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${acceptedConditions[idx] ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}
                        onClick={() => toggleCondition(idx)}
                      >
                        <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${acceptedConditions[idx] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
                          {acceptedConditions[idx] && <i className="fas fa-check text-[10px]"></i>}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-xs font-bold mb-1 ${acceptedConditions[idx] ? 'text-emerald-800' : 'text-slate-800'}`}>{condition.title}</h4>
                          <p className={`text-[11px] leading-relaxed ${acceptedConditions[idx] ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {condition.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Back
              </button>
            ) : <div />}
            
            <div className="flex flex-col items-end gap-2">
              <button 
                type="submit" 
                disabled={!isStepValid()}
                className={`px-10 py-3 rounded-2xl font-bold text-white shadow-lg transition-all ${isStepValid() ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95' : 'bg-slate-300 cursor-not-allowed'}`}
              >
                {step === 3 ? 'Complete Enrollment' : 'Save & Continue'}
              </button>
              {step === 3 && !isStepValid() && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">
                  {!formData.govId?.trim() ? 'Missing Govt ID' : 'Must accept all 10 conditions'}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorOnboardingView;
