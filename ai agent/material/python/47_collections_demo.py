from collections import Counter, defaultdict, OrderedDict, deque, namedtuple

# Counter: 计数
words = ["apple", "banana", "apple", "orange", "banana", "apple"]
word_count = Counter(words)
print(f"词频: {word_count}")
print(f"最高频: {word_count.most_common(2)}")

# defaultdict: 默认值字典
dd = defaultdict(list)
pairs = [("a", 1), ("b", 2), ("a", 3), ("c", 4)]
for k, v in pairs:
    dd[k].append(v)
print(f"defaultdict: {dict(dd)}")

# deque: 双端队列
dq = deque([1, 2, 3])
dq.appendleft(0)
dq.append(4)
dq.popleft()
dq.pop()
dq.rotate(1)
print(f"deque: {list(dq)}")

# namedtuple: 命名元组
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(f"Point: x={p.x}, y={p.y}")

# OrderedDict
od = OrderedDict()
od['first'] = 1
od['second'] = 2
od['third'] = 3
od.move_to_end('first')
print(f"OrderedDict: {list(od.keys())}")
