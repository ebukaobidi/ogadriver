import os
import re

files = []
for root, dirs, fnames in os.walk('mobile/src/screens'):
    for fname in fnames:
        if fname.endswith('.js'):
            files.append(os.path.join(root, fname).replace('\\', '/'))

changed = 0
for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match: import { ... SafeAreaView ... } from 'react-native';
    rn_import = re.search(r"import\s*\{([^}]+)\}\s*from\s*['\"]react-native['\"];", content)
    if rn_import and 'SafeAreaView' in rn_import.group(1):
        items = [i.strip() for i in rn_import.group(1).split(',')]
        new_items = [i for i in items if i != 'SafeAreaView' and i]
        new_rn = f"import {{ {', '.join(new_items)} }} from 'react-native';"
        content = content[:rn_import.start()] + new_rn + content[rn_import.end():]

        # Check if react-native-safe-area-context is already imported
        safe_import = re.search(r"import\s*\{([^}]+)\}\s*from\s*['\"]react-native-safe-area-context['\"];", content)
        if safe_import:
            safe_items = [i.strip() for i in safe_import.group(1).split(',')]
            if 'SafeAreaView' not in safe_items:
                safe_items.append('SafeAreaView')
                new_safe = f"import {{ {', '.join(safe_items)} }} from 'react-native-safe-area-context';"
                content = content[:safe_import.start()] + new_safe + content[safe_import.end():]
        else:
            content = content.replace(new_rn, new_rn + "\nimport { SafeAreaView } from 'react-native-safe-area-context';")

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        changed += 1
        print(f"Fixed SafeAreaView in: {fpath}")

print(f"Total files updated: {changed}")
