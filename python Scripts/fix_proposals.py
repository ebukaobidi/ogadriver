# -*- coding: utf-8 -*-
import io

path = 'frontend/src/components/driver/DriverProposalsTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("{activeSubTab !== 'market' && loading ? (", "{activeSubTab !== 'market' && (\n  loading ? (")
text = text.replace("      </div>\n    )}\n    </div>\n  );\n}", "      </div>\n    )\n    )}\n    </div>\n  );\n}")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
