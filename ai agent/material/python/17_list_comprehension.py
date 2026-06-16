numbers = list(range(1, 21))

squares = [x**2 for x in numbers]
even_squares = [x**2 for x in numbers if x % 2 == 0]
odd_cubes = [x**3 for x in numbers if x % 2 != 0]

matrix = [[i*j for j in range(1, 6)] for i in range(1, 6)]

flattened = [num for row in matrix for num in row]

words = ["hello", "world", "python", "code"]
word_lengths = {w: len(w) for w in words}
long_words_set = {w for w in words if len(w) > 4}

pairs = [(x, y) for x in range(3) for y in range(3) if x != y]

divisible = [f"{n}*" if n % 3 == 0 else str(n) for n in numbers[:10]]

print(squares)
print(even_squares)
print(odd_cubes)
print(matrix)
print(flattened)
print(word_lengths)
print(long_words_set)
print(pairs)
print(divisible)
