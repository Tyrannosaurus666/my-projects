import itertools

colors = ['red', 'green', 'blue']
sizes = ['S', 'M', 'L']

combinations = list(itertools.product(colors, sizes))
permutations = list(itertools.permutations(colors, 2))
combos = list(itertools.combinations(colors, 2))
combos_with_replacement = list(itertools.combinations_with_replacement(colors, 2))

print("Product:", combinations)
print("Permutations:", permutations)
print("Combinations:", combos)
print("Combos with replacement:", combos_with_replacement)

counter = itertools.count(start=10, step=2)
print("Count:", [next(counter) for _ in range(5)])

cycler = itertools.cycle(['A', 'B', 'C'])
print("Cycle:", [next(cycler) for _ in range(7)])

repeater = itertools.repeat('Hello', 3)
print("Repeat:", list(repeater))

data = [1, 2, 2, 3, 3, 3, 4, 4, 5]
grouped = itertools.groupby(sorted(data))
for key, group in grouped:
    print(f"{key}: {list(group)}")

chained = list(itertools.chain([1, 2], [3, 4], [5, 6]))
print("Chained:", chained)

accumulated = list(itertools.accumulate([1, 2, 3, 4, 5]))
print("Accumulate:", accumulated)
