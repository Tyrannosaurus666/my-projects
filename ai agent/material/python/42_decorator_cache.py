from functools import wraps
import time

def memoize(func):
    cache = {}
    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper

def retry(max_attempts=3, delay=0.5):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"重试 {attempt+1}/{max_attempts}: {e}")
                    time.sleep(delay)
        return wrapper
    return decorator

def validate_types(**types):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for arg_name, arg_type in types.items():
                if arg_name in kwargs:
                    if not isinstance(kwargs[arg_name], arg_type):
                        raise TypeError(f"{arg_name} must be {arg_type}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

@memoize
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(35))
