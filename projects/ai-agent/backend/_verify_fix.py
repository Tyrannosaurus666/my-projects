"""快速验证 AST 修复后的端到端流程"""
import requests, time

BASE = 'http://localhost:8000'

files = {'file': ('test_fix.py', b'def add(a,b):\n    s = a + b\n    return s\n\nfor i in range(3):\n    print(add(i,i*2))\n', 'text/plain')}
up = requests.post(f'{BASE}/upload', files=files).json()
fid = up['file_id']

requests.post(f'{BASE}/analyze/{fid}')
for i in range(10):
    time.sleep(1)
    st = requests.get(f'{BASE}/analyze/{fid}/status').json()
    if st['status'] == 'completed':
        break

res = requests.get(f'{BASE}/result/{fid}').json()
ast = res['ast_result']
print(f'AST error: {"error" in ast}')
print(f'AST keys: {list(ast.keys())}')
print(f'functions: {len(ast.get("functions",[]))}')
print(f'loops: {len(ast.get("loops",[]))}')
print(f'summary: {ast.get("summary","")}')

requests.delete(f'{BASE}/files/{fid}')
print('PASSED' if 'functions' in ast and not 'error' in ast else 'FAILED')
