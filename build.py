"""Build AuditOS into one self-contained HTML file: docs/index.html.

Usage:  python3 build.py
No dependencies. The output works offline (fonts load from Google Fonts when online)
and is served by GitHub Pages from the /docs folder.
"""
import pathlib

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / 'src'

# Order matters: shared data first, then each industry, then the app.
JS_FILES = [
    'data/shared.js',
    'data/financial.js',
    'data/crypto.js',
    'data/manufacturing.js',
    'data/retail.js',
    'js/core.js',
    'js/home-dashboard-sensing.js',
    'js/assessment-planning.js',
    'js/fieldwork-issues-reporting-agents.js',
]

css = (SRC / 'styles.css').read_text(encoding='utf-8')
js = '\n'.join(f'/* ---- {f} ---- */\n' + (SRC / f).read_text(encoding='utf-8') for f in JS_FILES)

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AuditOS Internal Audit Suite</title>
<meta name="description" content="AI-first internal audit orchestration prototype: risk sensing, assessment, planning, fieldwork, issues and reporting with human-in-the-loop agents.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
<script>
{js}
</script>
</body>
</html>
'''

out = ROOT / 'docs' / 'index.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'Built {out} ({len(html):,} bytes)')
