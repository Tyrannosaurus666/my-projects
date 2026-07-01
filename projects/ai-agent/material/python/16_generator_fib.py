def fibonacci_generator(limit):
    a, b = 0, 1
    count = 0
    while count < limit:
        yield a
        a, b = b, a + b
        count += 1

def read_lines_generator(filename):
    with open(filename, 'r') as f:
        for line in f:
            yield line.strip()

def infinite_counter(start=0):
    while True:
        yield start
        start += 1

fib_gen = fibonacci_generator(15)
fib_list = list(fib_gen)
print(fib_list)

gen_expr = (x**2 for x in range(10) if x % 2 == 0)
print(list(gen_expr))

counter = infinite_counter(100)
for _ in range(5):
    print(next(counter))
