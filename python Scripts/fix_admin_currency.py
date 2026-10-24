# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/AdminDashboard.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# I will define a formatCurrency function at the top
currency_func = """
const formatCurrency = (amount, currencyCode = 'NGN') => {
  const code = currencyCode.toUpperCase();
  let symbol = '₦';
  if (code === 'GHS') symbol = 'GH₵';
  if (code === 'KES') symbol = 'KSh';
  if (code === 'ZAR') symbol = 'R';
  if (code === 'USD') symbol = '$';
  return `${symbol}${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
};
"""
# Need to inject this inside the component or outside. Let's put it outside.
text = text.replace("function AdminDashboard() {", currency_func + "\nfunction AdminDashboard() {")

# Now replace hardcoded Naira formatting
# ₦{((telemetry?.financials?.platform_revenue_month || 0) / 1000000).toFixed(1)}M
text = re.sub(r",\{\(\(telemetry\?\.financials\?\.platform_revenue_month \|\| 0\) \/ 1000000\)\.toFixed\(1\)\}M", "{formatCurrency(((telemetry?.financials?.platform_revenue_month || 0) / 1000000))}M", text)

text = re.sub(r",\{\(\(telemetry\?\.financials\?\.total_access_fees \|\| 0\) \/ 1000000\)\.toFixed\(1\)\}M", "{formatCurrency(((telemetry?.financials?.total_access_fees || 0) / 1000000))}M", text)

text = re.sub(r",\{\(\(telemetry\?\.financials\?\.subscription_revenue \|\| 0\) \/ 1000000\)\.toFixed\(1\)\}M", "{formatCurrency(((telemetry?.financials?.subscription_revenue || 0) / 1000000))}M", text)

# Update descriptions
text = text.replace("(in Millions ,)", "(in Millions, Local Currency)")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
