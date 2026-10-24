# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProposalsTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# I will find the end of the ternary and fix the brackets.
# It seems there is an extra `)}` before the closing `</div>`.
# Let's fix the whole structure manually from the start of `{activeSubTab !== 'market' && loading ? (` to the end.

# Let's just do:
text = text.replace('    )}\n    </div>\n  );\n}', '    )}\n    </div>\n  );\n}')
# Wait, let me just find all `)}` before `</div>` and see if they balance.

# Let's output the file line by line to see where it breaks.
