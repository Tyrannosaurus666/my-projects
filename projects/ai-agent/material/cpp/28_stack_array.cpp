#include <iostream>
using namespace std;

class Stack {
    int* arr;
    int top;
    int capacity;
public:
    Stack(int size) : capacity(size), top(-1) {
        arr = new int[capacity];
    }

    void push(int x) {
        if (top == capacity - 1) {
            throw "Stack overflow";
        }
        arr[++top] = x;
    }

    int pop() {
        if (top == -1) {
            throw "Stack underflow";
        }
        return arr[top--];
    }

    int peek() {
        if (top == -1) {
            throw "Stack is empty";
        }
        return arr[top];
    }

    bool isEmpty() { return top == -1; }
    int size() { return top + 1; }

    ~Stack() { delete[] arr; }
};

bool isValidParentheses(string expr) {
    Stack stk(expr.length());
    for (char ch : expr) {
        if (ch == '(' || ch == '[' || ch == '{') {
            stk.push(ch);
        } else if (ch == ')' || ch == ']' || ch == '}') {
            if (stk.isEmpty()) return false;
            char top = stk.pop();
            if ((ch == ')' && top != '(') ||
                (ch == ']' && top != '[') ||
                (ch == '}' && top != '{')) {
                return false;
            }
        }
    }
    return stk.isEmpty();
}

int main() {
    cout << isValidParentheses("{[()]}") << endl;
    cout << isValidParentheses("{[(])}") << endl;
    return 0;
}
