first_name = "Zhang"
last_name = "San"
full_name = last_name + " " + first_name

text = "Hello, " + full_name + "!"
text += " Welcome to Python."
text = text.replace("Python", "Python World")
words = text.split(" ")
joined = "-".join(words)
upper_text = text.upper()
title_text = text.title()

print(full_name)
print(text)
print(joined)
print(upper_text)
print(title_text)

sub = text[7:12]
found = text.find("Python")
count = text.count("o")
print(sub, found, count)
