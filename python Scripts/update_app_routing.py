# -*- coding: utf-8 -*-
import re
import io

path = 'frontend/src/App.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add import
import_pattern = r"import HomePwaRedirect from '\.\/components\/HomePwaRedirect';"
new_import = """import HomePwaRedirect from './components/HomePwaRedirect';\nimport PromoterPortal from './pages/PromoterPortal';"""
text = re.sub(import_pattern, new_import, text)

# Add Route
route_pattern = r'<Route path="\/driver" element=\{<DriverRoute><DriverPortal \/><\/DriverRoute>\} \/>'
new_route = """<Route path="/driver" element={<DriverRoute><DriverPortal /></DriverRoute>} />
              <Route path="/promoter" element={<PromoterPortal />} />"""
text = re.sub(route_pattern, new_route, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
