import re

path = 'frontend/src/components/driver/DriverSubscriptionsTab.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'<p className="text-slate-400 text-xs mb-4">\{plan\.description \|\| plan\.limits\}<\/p>\s*<\/div>', re.DOTALL)

replacement = '''<p className="text-slate-400 text-xs mb-3 pb-3 border-b border-slate-700/50">{plan.description || plan.limits}</p>
                    
                    {/* Features List */}
                    {(plan.features && Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => {
                        const isZeroCommission = typeof feature === 'string' && feature.toLowerCase().includes('0% commission');
                        return (
                          <div key={idx} className="flex items-start gap-2 mb-2">
                            {isZeroCommission ? (
                                <Zap className="w-4 h-4 text-[#1cd188] mt-0.5 flex-shrink-0" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={	ext-xs }>
                                {feature}
                            </span>
                          </div>
                        );
                    })}
                  </div>'''

text = pattern.sub(replacement, text)
with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
