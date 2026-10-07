import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Printer, ShieldCheck, ArrowLeft } from 'lucide-react';

function GuarantorForm() {
  const { formType, driverId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Try to pull the driver's name from query parameters (e.g., ?name=Chukwuebuka%20Onwuadike)
  const driverName = searchParams.get('name') || '';
  const date = new Date().toLocaleDateString('en-GB');
  
  const displayDriverId = driverId && driverId !== 'DRV-TEMP' && driverId !== 'null'
    ? driverId 
    : 'OGD-NG-LA-TEMP'; // Temporary fallback when driver ID is not available
  
  // Deterministic document verification routing code
  const code = displayDriverId;

  // Trigger browser print interface immediately if requested via query parameter
  useEffect(() => {
    if (searchParams.get('autoprint') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-200 py-10 print:bg-white print:py-0 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-12 shadow-2xl print:shadow-none print:p-0 relative">
        
        {/* Print Controls - Hidden during print */}
        <div className="absolute top-4 right-4 flex gap-3 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition"
          >
            <Printer size={16} /> Print Document
          </button>
          <button 
            onClick={() => window.close()}
            className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
          >
            Close Page
          </button>
        </div>

        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-start pt-8">
          <div className="flex flex-col gap-2">
            {/* Fallback to text styling if the public svg asset hasn't mounted */}
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-slate-900" /> OGADRIVER
            </h1>
            <p className="font-mono text-xs tracking-widest text-slate-600">OPERATIVE TERMINAL COMMAND</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase text-slate-500 mb-1">Document Control ID</p>
            <div className="border-2 border-slate-900 px-4 py-1.5 font-mono text-lg font-black tracking-widest bg-slate-50">
              {code}
            </div>
            <p className="text-xs mt-2 font-bold text-red-600 uppercase tracking-wider">
              Phase {formType || 'A'} Declaration
            </p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-black uppercase underline mb-8 tracking-wide">
          Guarantor Declaration & Liability Agreement
        </h2>

        {/* Operative Info */}
        <div className="bg-slate-50 border-2 border-slate-200 p-6 mb-8 rounded-xl">
          <h3 className="font-bold text-sm uppercase border-b border-slate-200 pb-2 mb-4 tracking-wider">
            Subject (Operative) Details
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-mono">Operative Name</p>
              {driverName ? (
                <p className="font-bold text-md text-slate-900 mt-2 border-b border-slate-200 pb-1">
                  {driverName}
                </p>
              ) : (
                <div className="border-b-2 border-slate-300 h-8 w-full mt-1"></div>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-mono">Operative ID</p>
              <p className="font-mono font-bold text-md text-slate-900 mt-2">
                {displayDriverId}
              </p>
            </div>
          </div>
        </div>

        {/* Guarantor Details */}
        <h3 className="font-bold text-sm uppercase border-b border-slate-900 pb-2 mb-6 tracking-wider">
          Guarantor Information <span className="text-xs font-normal text-slate-500 lowercase">(to be completed in block letters)</span>
        </h3>
        
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 gap-6">
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">Full Name (Surname First)</p>
                <div className="border-b-2 border-slate-300 h-8 w-full"></div>
             </div>
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">Residential Address (Not P.O. Box)</p>
                <div className="border-b-2 border-slate-300 h-8 w-full mb-2"></div>
                <div className="border-b-2 border-slate-300 h-8 w-full"></div>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">Occupation / Profession</p>
                <div className="border-b-2 border-slate-300 h-8 w-full"></div>
             </div>
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">Employer / Business Name</p>
                <div className="border-b-2 border-slate-300 h-8 w-full"></div>
             </div>
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">Phone Number(s)</p>
                <div className="border-b-2 border-slate-300 h-8 w-full"></div>
             </div>
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">Email Address</p>
                <div className="border-b-2 border-slate-300 h-8 w-full"></div>
             </div>
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">National Identity Number (NIN)</p>
                <div className="border-b-2 border-slate-300 h-8 w-full"></div>
             </div>
             <div>
                <p className="text-[10px] uppercase text-slate-500 font-mono mb-1">Relationship to Operative</p>
                <div className="border-b-2 border-slate-300 h-8 w-full"></div>
             </div>
          </div>
        </div>

        {/* Declaration */}
        <h3 className="font-bold text-sm uppercase border-b border-slate-900 pb-2 mb-4 tracking-wider">
          Legal Declaration & Indemnity
        </h3>
        <div className="bg-slate-100 print:bg-white print:border-y p-6 text-xs text-justify leading-relaxed border-l-4 border-slate-900 mb-8 font-serif">
          <p className="mb-4">
            I, the undersigned, hereby declare that I have known the Operative named above for a period of ______ years. I vouch for their good character, integrity, and fitness to operate as a professional driver under the OgaDriver platform.
          </p>
          <p className="mb-4">
            I hereby unequivocally agree to act as a guarantor for the Operative. In the event that the Operative commits any act of fraud, theft, abscondment with a client's vehicle or property, or causes intentional damage during their deployment, I assume <strong>FULL CIVIL AND CRIMINAL LIABILITY</strong> for their actions.
          </p>
          <p>
            I agree to indemnify the Employer and OgaDriver Limited against any loss, damages, or financial liabilities incurred as a direct result of the Operative's misconduct. I confirm that all information provided in this document is true and accurate to the best of my knowledge, under the laws of the Federal Republic of Nigeria.
          </p>
        </div>

        {/* Signatures & Biometrics */}
        <div className="grid grid-cols-3 gap-8 mb-12">
           <div className="col-span-2">
              <div className="mb-8">
                 <p className="text-[10px] uppercase text-slate-500 font-mono mb-12">Guarantor's Signature</p>
                 <div className="border-b-2 border-slate-900 w-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <p className="text-[10px] uppercase text-slate-500 font-mono mb-12">Date</p>
                    <div className="border-b-2 border-slate-900 w-full text-center font-bold pb-1">{date}</div>
                 </div>
                 <div className="flex flex-col items-center justify-end">
                    <div className="w-24 h-32 border-2 border-slate-400 border-dashed rounded-lg flex items-center justify-center bg-slate-50">
                       <span className="text-[10px] text-slate-400 uppercase text-center p-2 font-mono">Right Thumbprint</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="col-span-1 flex justify-center items-start">
              <div className="w-40 h-48 border-2 border-slate-900 p-1">
                 <div className="w-full h-full border border-slate-300 bg-slate-50 flex items-center justify-center flex-col text-center p-4">
                    <span className="text-xs text-slate-500 uppercase font-bold">Attach Passport Photograph Here</span>
                    <span className="text-[9px] text-slate-400 mt-2 font-mono">(Must show both ears clearly)</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-300 pt-4 text-center mt-auto">
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
            <strong>INSTRUCTIONS FOR OPERATIVE:</strong> After completion, upload a clear scanned copy of this document and a live selfie of the Guarantor holding this document to your Terminal. Retain the physical copy.
          </p>
        </div>

      </div>
    </div>
  );
}

export default GuarantorForm;
