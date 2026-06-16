import json

# 序列化
data = {
    "name": "Project X",
    "version": "1.0.0",
    "authors": ["Alice", "Bob"],
    "settings": {"debug": True, "max_connections": 100}
}

json_str = json.dumps(data, indent=2, ensure_ascii=False)
print("JSON string:")
print(json_str)

# 反序列化
parsed = json.loads(json_str)
print(f"Name: {parsed['name']}")

# 文件读写
with open("config.json", "w") as f:
    json.dump(data, f, indent=2)

with open("config.json", "r") as f:
    loaded = json.load(f)

# 自定义编码
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

def point_encoder(obj):
    if isinstance(obj, Point):
        return {"x": obj.x, "y": obj.y}
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

print(json.dumps(Point(3, 4), default=point_encoder))
