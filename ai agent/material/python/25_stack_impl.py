class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("Pop from empty stack")
        return self.items.pop()

    def peek(self):
        if self.is_empty():
            return None
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

def is_balanced_parentheses(expr):
    stack = Stack()
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in expr:
        if ch in '([{':
            stack.push(ch)
        elif ch in ')]}':
            if stack.is_empty() or stack.pop() != pairs[ch]:
                return False
    return stack.is_empty()

def evaluate_postfix(expr):
    stack = Stack()
    for token in expr.split():
        if token.isdigit():
            stack.push(int(token))
        else:
            b = stack.pop()
            a = stack.pop()
            if token == '+':
                stack.push(a + b)
            elif token == '-':
                stack.push(a - b)
            elif token == '*':
                stack.push(a * b)
            elif token == '/':
                stack.push(a / b)
    return stack.pop()

print(is_balanced_parentheses("{[()]}"))
print(is_balanced_parentheses("{[(])}"))
print(evaluate_postfix("3 4 + 2 * 7 /"))
