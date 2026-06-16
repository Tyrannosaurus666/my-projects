# 自定义上下文管理器
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        if exc_type:
            print(f"异常: {exc_type.__name__}: {exc_val}")
        return False

# 使用 contextlib
from contextlib import contextmanager

@contextmanager
def timer_context(name):
    import time
    start = time.time()
    yield
    end = time.time()
    print(f"{name}: {end - start:.4f}秒")

with FileManager("test.txt", "w") as f:
    f.write("Hello from context manager!")

with timer_context("文件操作"):
    with open("test.txt", "r") as f:
        content = f.read()
        print(content)
