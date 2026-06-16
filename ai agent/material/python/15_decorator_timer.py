import time

# 计时装饰器
def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行时间: {end - start:.4f}秒")
        return result
    return wrapper

def repeat(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@timer
@repeat(3)
def compute_sum(n):
    return sum(range(n))

@timer
def slow_function():
    time.sleep(0.5)
    return "Done"

print(compute_sum(1000000))
print(slow_function())
