def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)

def binary_search(arr, target, low, high):
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] > target:
        return binary_search(arr, target, low, mid - 1)
    else:
        return binary_search(arr, target, mid + 1, high)

def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

print(factorial(5))
print(fibonacci(10))
print(gcd(48, 18))
arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(arr, 7, 0, len(arr)-1))
print(power(2, 8))
