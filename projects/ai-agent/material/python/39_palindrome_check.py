def is_palindrome(s):
    s = ''.join(ch.lower() for ch in s if ch.isalnum())
    return s == s[::-1]

def longest_palindrome(s):
    n = len(s)
    if n <= 1:
        return s
    start, max_len = 0, 1
    for i in range(n):
        left, right = i, i
        while left >= 0 and right < n and s[left] == s[right]:
            if right - left + 1 > max_len:
                start = left
                max_len = right - left + 1
            left -= 1
            right += 1
        left, right = i, i + 1
        while left >= 0 and right < n and s[left] == s[right]:
            if right - left + 1 > max_len:
                start = left
                max_len = right - left + 1
            left -= 1
            right += 1
    return s[start:start+max_len]

def count_palindromic_substrings(s):
    n = len(s)
    count = 0
    for center in range(2 * n - 1):
        left = center // 2
        right = left + center % 2
        while left >= 0 and right < n and s[left] == s[right]:
            count += 1
            left -= 1
            right += 1
    return count

print(is_palindrome("A man a plan a canal Panama"))
print(is_palindrome("race a car"))
print(longest_palindrome("babad"))
print(count_palindromic_substrings("aaa"))
