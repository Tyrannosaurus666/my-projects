def reverse_string(s):
    return s[::-1]

def reverse_words(s):
    words = s.split()
    return ' '.join(reversed(words))

def reverse_words_in_place(s):
    return ' '.join(word[::-1] for word in s.split())

def reverse_recursive(s):
    if len(s) <= 1:
        return s
    return reverse_recursive(s[1:]) + s[0]

def reverse_only_letters(s):
    chars = list(s)
    left, right = 0, len(chars) - 1
    while left < right:
        if not chars[left].isalpha():
            left += 1
        elif not chars[right].isalpha():
            right -= 1
        else:
            chars[left], chars[right] = chars[right], chars[left]
            left += 1
            right -= 1
    return ''.join(chars)

text = "Hello World from Python"
print(reverse_string(text))
print(reverse_words(text))
print(reverse_words_in_place(text))
print(reverse_recursive("hello"))
print(reverse_only_letters("a-bC-dEf-ghIj"))
