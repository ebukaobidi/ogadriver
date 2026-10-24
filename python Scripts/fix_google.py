# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/api/auth.js'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_google = """  googleLogin: () => {
    // Use web route (not /api/) so Google OAuth redirect_uri matches exactly
    // The redirect_uri registered in Google Console is https://ogadriver.ng/auth/google/callback
    window.location.href = `${window.location.origin}/auth/google`;
  },"""

new_google = """  googleLogin: () => {
    // Determine the root backend URL from the API base URL
    let rootUrl = (api.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    if (rootUrl && rootUrl.startsWith('http')) {
      window.location.href = `${rootUrl}/auth/google`;
    } else {
      window.location.href = `${window.location.origin}/auth/google`;
    }
  },"""

text = text.replace(old_google, new_google)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

