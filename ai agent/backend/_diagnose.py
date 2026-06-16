"""诊断前端不显示结果的问题"""
import requests
import time

BASE = 'http://localhost:8000'

# 上传测试文件
files = {'file': ('test_show.py', b'def add(a,b):\n    s = a + b\n    return s\n\nfor i in range(3):\n    print(add(i,i*2))\n', 'text/plain')}
up = requests.post(f'{BASE}/upload', files=files).json()
fid = up['file_id']
print(f'Upload: file_id={fid}')

# 触发分析
requests.post(f'{BASE}/analyze/{fid}')
for i in range(15):
    time.sleep(1)
    st = requests.get(f'{BASE}/analyze/{fid}/status').json()
    if st['status'] == 'completed':
        break

# 获取结果
res = requests.get(f'{BASE}/result/{fid}').json()
print(f'filename={res["filename"]}, language={res["language"]}')
print()

print('=== AST result type ===')
ast = res['ast_result']
print(f'type={type(ast).__name__}')
if isinstance(ast, dict):
    print(f'keys={list(ast.keys())}')
    print(f'summary={ast.get("summary","")}')
    print(f'functions={len(ast.get("functions",[]))}')
    print(f'classes={len(ast.get("classes",[]))}')

print()
print('=== LLM result type ===')
llm = res['llm_result']
print(f'type={type(llm).__name__}')
if isinstance(llm, dict) and 'error' in llm:
    print(f'error={llm["error"][:100]}')
elif isinstance(llm, str):
    print(f'string len={len(llm)}, preview={llm[:100]}')

# 清理
requests.delete(f'{BASE}/files/{fid}')
print('\ndone')
