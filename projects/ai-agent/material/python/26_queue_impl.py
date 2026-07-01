# 队列实现
class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Dequeue from empty queue")
        return self.items.pop(0)

    def front(self):
        return self.items[0] if self.items else None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

# 循环队列
class CircularQueue:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = [None] * capacity
        self.front = 0
        self.rear = 0
        self.count = 0

    def enqueue(self, item):
        if self.count == self.capacity:
            raise OverflowError("Queue is full")
        self.items[self.rear] = item
        self.rear = (self.rear + 1) % self.capacity
        self.count += 1

    def dequeue(self):
        if self.count == 0:
            raise IndexError("Queue is empty")
        item = self.items[self.front]
        self.front = (self.front + 1) % self.capacity
        self.count -= 1
        return item

q = Queue()
for v in [1, 2, 3]:
    q.enqueue(v)
print(q.dequeue(), q.dequeue())
