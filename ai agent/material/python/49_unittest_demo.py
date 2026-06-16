import unittest

# 被测试的函数
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def is_palindrome(s):
    return s == s[::-1]

# 测试类
class TestMathFunctions(unittest.TestCase):
    def test_add_positive(self):
        self.assertEqual(add(2, 3), 5)

    def test_add_negative(self):
        self.assertEqual(add(-1, -1), -2)

    def test_divide_normal(self):
        self.assertAlmostEqual(divide(10, 3), 3.333333, places=5)

    def test_divide_by_zero(self):
        with self.assertRaises(ValueError):
            divide(10, 0)

class TestStringFunctions(unittest.TestCase):
    def test_palindrome_true(self):
        self.assertTrue(is_palindrome("radar"))

    def test_palindrome_false(self):
        self.assertFalse(is_palindrome("hello"))

if __name__ == "__main__":
    unittest.main(argv=[''], exit=False)
