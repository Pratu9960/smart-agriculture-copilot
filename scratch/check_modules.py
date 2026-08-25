import sys

for mod in ['selenium', 'playwright', 'requests', 'websocket', 'urllib']:
    try:
        __import__(mod)
        print(f"Python module '{mod}': Available")
    except ImportError:
        print(f"Python module '{mod}': Not available")
