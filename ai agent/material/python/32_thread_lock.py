import threading

class ThreadSafeCounter:
    def __init__(self):
        self._count = 0
        self._lock = threading.Lock()

    def increment(self):
        with self._lock:
            self._count += 1

    def decrement(self):
        with self._lock:
            self._count -= 1

    def get_value(self):
        with self._lock:
            return self._count

class BoundedBuffer:
    def __init__(self, capacity):
        self.buffer = []
        self.capacity = capacity
        self.mutex = threading.Lock()
        self.not_full = threading.Condition(self.mutex)
        self.not_empty = threading.Condition(self.mutex)

    def put(self, item):
        with self.mutex:
            while len(self.buffer) >= self.capacity:
                self.not_full.wait()
            self.buffer.append(item)
            self.not_empty.notify()

    def get(self):
        with self.mutex:
            while len(self.buffer) == 0:
                self.not_empty.wait()
            item = self.buffer.pop(0)
            self.not_full.notify()
            return item

counter = ThreadSafeCounter()
threads = []
for _ in range(10):
    t = threading.Thread(target=lambda: [counter.increment() for _ in range(10000)])
    threads.append(t)
    t.start()
for t in threads:
    t.join()
print(f"Thread-safe counter: {counter.get_value()}")
