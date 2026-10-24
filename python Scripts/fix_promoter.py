# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/pages/PromoterPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(r"\https://ogadriver.ng/register?ref=\\", "`https://ogadriver.ng/register?ref=${user?.referral_code || 'OGA10X'}`")
text = text.replace(r"https://ogadriver.ng/register?ref=\\", "`https://ogadriver.ng/register?ref=${user?.referral_code || 'OGA10X'}`")

# Also check for other broken template literals in that file!
text = text.replace(r"navigator.clipboard.writeText(\\", "")
text = text.replace(r"navigator.clipboard.writeText(referralLink);", "navigator.clipboard.writeText(referralLink);")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

