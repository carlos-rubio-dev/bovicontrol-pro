"""Ejecuta cada script de pruebas con su propio proceso y base temporal."""
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
tests = sorted((root / 'tests').glob('test_*.py'))
for path in tests:
    result = subprocess.run([sys.executable, str(path)], cwd=root)
    if result.returncode:
        raise SystemExit(result.returncode)
print(f'{len(tests)} scripts de backend correctos.')
