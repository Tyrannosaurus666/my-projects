import threading
import time

# 共享变量 - 注意：存在竞态条件
counter = 0

def increment():
    global counter
    for _ in range(100000):
        counter += 1  # 非原子操作，多线程不安全

def worker(name, delay):
    """工作线程函数"""
    for i in range(3):
        time.sleep(delay)
        print(f"线程 {name}: 第{i+1}次执行")

def download_file(url):
    time.sleep(1)
    return f"Downloaded from {url}"

threads = []
for i in range(3):
    t = threading.Thread(target=worker, args=(f"W{i}", 0.5))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

# 竞态条件演示
t1 = threading.Thread(target=increment)
t2 = threading.Thread(target=increment)
t1.start()
t2.start()
t1.join()
t2.join()
print(f"Counter (可能有误): {counter}")
