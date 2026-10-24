import sys, re
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'backend/frontend/src/components/hirer/MobileHireDirectory.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the horizontal scroll categories with a full grid layout when 'all' is selected,
# OR a horizontal scroll with icons when a specific category is selected.

old_cat_block = r'''<div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
                category === item.id
                  ? 'bg-emerald-400 text-slate-950'
                  : 'border border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>'''

new_cat_block = '''{category === 'all' ? (
          <div className="mt-4 grid grid-cols-2 gap-3 pb-2">
            {CATEGORIES.filter(c => c.id !== 'all').map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left transition hover:border-[#1cd188]/50 hover:bg-[#1cd188]/10"
                >
                  <div className="rounded-xl bg-[#1cd188]/20 p-2 text-[#1cd188]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.label}</h4>
                    <p className="mt-1 text-[10px] leading-tight text-slate-400">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  aria-pressed={category === item.id}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${
                    category === item.id
                      ? 'bg-[#1cd188] text-slate-950'
                      : 'border border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        )}'''

# Replace exactly but ignore whitespace variations if exact match fails
if old_cat_block in text:
    text = text.replace(old_cat_block, new_cat_block)
else:
    # Just do a regex to replace between `<div className="mt-3 flex gap-2 overflow-x-auto pb-1">` and `</section>`
    text = re.sub(
        r'<div className="mt-3 flex gap-2 overflow-x-auto pb-1">.*?</button>\s*\}\)\}\s*</div>',
        new_cat_block,
        text,
        flags=re.DOTALL
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("Category layout updated")
