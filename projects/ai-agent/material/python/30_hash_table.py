class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        return hash(key) % self.size

    def put(self, key, value):
        idx = self._hash(key)
        for i, (k, v) in enumerate(self.table[idx]):
            if k == key:
                self.table[idx][i] = (key, value)
                return
        self.table[idx].append((key, value))

    def get(self, key):
        idx = self._hash(key)
        for k, v in self.table[idx]:
            if k == key:
                return v
        raise KeyError(f"Key '{key}' not found")

    def remove(self, key):
        idx = self._hash(key)
        for i, (k, v) in enumerate(self.table[idx]):
            if k == key:
                del self.table[idx][i]
                return
        raise KeyError(f"Key '{key}' not found")

    def contains(self, key):
        try:
            self.get(key)
            return True
        except KeyError:
            return False

    def keys(self):
        result = []
        for bucket in self.table:
            for k, v in bucket:
                result.append(k)
        return result

ht = HashTable()
ht.put("name", "Alice")
ht.put("age", 25)
ht.put("city", "Beijing")
print(ht.get("name"))
print(ht.keys())
print(ht.contains("age"))
