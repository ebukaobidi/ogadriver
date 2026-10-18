import urllib.request, re

req = urllib.request.Request('http://169.58.115.46', headers={'Host': 'ogadriver.ng', 'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req)
html = resp.read().decode('utf-8')
print('VPS Assets:\n', re.findall(r'/assets/[a-zA-Z0-9_\-]+\.(?:js|css)', html))
