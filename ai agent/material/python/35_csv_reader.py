import csv

def read_csv(filename):
    with open(filename, 'r', newline='') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = []
        for row in reader:
            rows.append(dict(zip(header, row)))
        return rows

def write_csv(filename, data, fieldnames):
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

sample_data = [
    {"name": "Alice", "age": "25", "city": "Beijing"},
    {"name": "Bob", "age": "30", "city": "Shanghai"},
    {"name": "Charlie", "age": "28", "city": "Shenzhen"},
]

write_csv("sample.csv", sample_data, ["name", "age", "city"])
rows = read_csv("sample.csv")
for row in rows:
    print(f"{row['name']} - {row['age']} - {row['city']}")

with open("sample.csv", 'r') as f:
    content = f.read()
    print("Raw CSV:", content[:100])
