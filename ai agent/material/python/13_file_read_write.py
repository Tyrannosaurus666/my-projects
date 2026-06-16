f = open("sample.txt", "w")
f.write("Line 1: Hello World\n")
f.write("Line 2: Python File IO\n")
f.write("Line 3: Testing\n")
f.close()

f = open("sample.txt", "r")
content = f.read()
f.close()
print("Full content:")
print(content)

f = open("sample.txt", "r")
lines = f.readlines()
f.close()
for i, line in enumerate(lines):
    print(f"Line {i+1}: {line.strip()}")

f = open("sample.txt", "a")
f.write("Line 4: Appended\n")
f.close()

with open("sample.txt", "r") as f:
    for line in f:
        print(line, end="")

with open("output.txt", "w") as f:
    f.write("Processed data\n")
