# 判断是否素数
def is_prime(n):
    # 小于2不是素数
    if n < 2:
        return False
    # 循环检查
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

# 生成素数
def generate_primes(limit):
    primes = []
    for num in range(2, limit + 1):
        if is_prime(num):
            primes.append(num)
    return primes

# 筛法
def sieve_of_eratosthenes(n):
    is_prime_arr = [True] * (n + 1)
    is_prime_arr[0] = is_prime_arr[1] = False
    for i in range(2, int(n**0.5) + 1):
        if is_prime_arr[i]:
            for j in range(i*i, n + 1, i):
                is_prime_arr[j] = False
    return [i for i in range(n+1) if is_prime_arr[i]]

print(is_prime(97))
print(generate_primes(50))
print(sieve_of_eratosthenes(50))
