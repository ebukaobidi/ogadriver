import urllib.request
import mimetypes
import uuid
import json

file_path = 'c:\\xampp\\htdocs\\ogadriver.ng\\pwa_update.zip'
boundary = '----WebKitFormBoundary' + uuid.uuid4().hex

with open(file_path, 'rb') as f:
    file_bytes = f.read()

body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="pwa_update.zip"\r\n'
    f'Content-Type: application/zip\r\n\r\n'
).encode('utf-8') + file_bytes + f'\r\n--{boundary}--\r\n'.encode('utf-8')

req = urllib.request.Request(
    'https://tmpfiles.org/api/v1/upload',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}', 'User-Agent': 'Mozilla/5.0'}
)

resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode('utf-8'))
url = data['data']['url']
direct_url = url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
print('DIRECT_URL=' + direct_url)
