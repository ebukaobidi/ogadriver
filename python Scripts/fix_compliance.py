# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverComplianceTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Inject isIndependent constant
text = re.sub(r"const \[isCameraOpen, setIsCameraOpen\] = useState\(false\);", "const [isCameraOpen, setIsCameraOpen] = useState(false);\n  const isIndependent = driver?.has_vehicle === true;", text)

# Change Step 2 title based on isIndependent
text = re.sub(r"<span>Guarantor A</span>", "{isIndependent ? <span>Vehicle Papers</span> : <span>Guarantor A</span>}", text)

# Change Step 3 title
text = re.sub(r"<span>Guarantor B</span>", "{isIndependent ? <span>Vehicle Photos</span> : <span>Guarantor B</span>}", text)

# Update Step titles in the progress tracker
text = re.sub(r"Guarantor A</span", "{isIndependent ? 'Vehicle Papers' : 'Guarantor A'}</span", text)
text = re.sub(r"Guarantor B</span", "{isIndependent ? 'Vehicle Photos' : 'Guarantor B'}</span", text)

# Update the actual Step 2 block
step2_old = r"\{vettingStep === 2 && \(\s*<div className=\"bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 animate-slide-up\">"
step2_new = """{vettingStep === 2 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 animate-slide-up">
                {isIndependent ? (
                  <div className="text-center py-12">
                    <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Vehicle Papers Verification</h3>
                    <p className="text-slate-400 max-w-md mx-auto">Upload your Vehicle License, Insurance, and MOT to activate Independent Operator mode. (Vehicle Verification Module is currently active in backend processing)</p>
                    <button onClick={() => setVettingStep(3)} className="mt-8 bg-brandMint text-corporateNavy px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400">Proceed to Step 3</button>
                  </div>
                ) : ("""
text = re.sub(step2_old, step2_new, text)
text = re.sub(r"\{/\* STEP 3: Guarantor B \*/\}", ")}\n            {/* STEP 3: Guarantor B */}", text)

# Update the actual Step 3 block
step3_old = r"\{vettingStep === 3 && \(\s*<div className=\"bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 animate-slide-up\">"
step3_new = """{vettingStep === 3 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 animate-slide-up">
                {isIndependent ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Vehicle Exterior & Interior</h3>
                    <p className="text-slate-400 max-w-md mx-auto">Submit high-quality photos of your vehicle for physical inspection. (Vehicle Inspection Module is currently active in backend processing)</p>
                    <button onClick={() => setVettingStep(1)} className="mt-8 text-slate-400 hover:text-white px-6 py-3 font-bold text-sm">Back to Step 1</button>
                  </div>
                ) : ("""
text = re.sub(step3_old, step3_new, text)

# Close the ternary for Step 3
text = re.sub(r"(\s*)</div>\s*</div>\s*\);\s*};\s*export default DriverComplianceTab;", r"\1)}\n          </div>\n        </div>\n      </div>\n    );\n  };\n\nexport default DriverComplianceTab;", text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

