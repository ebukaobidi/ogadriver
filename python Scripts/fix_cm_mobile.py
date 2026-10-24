import io
path = 'mobile/src/utils/CurrencyManager.js'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('return ;', 'return ${symbol};')

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
