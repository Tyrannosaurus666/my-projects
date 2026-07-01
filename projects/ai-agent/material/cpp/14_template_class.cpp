#include <iostream>
using namespace std;

template <typename T, int SIZE>
class Stack {
    T data[SIZE];
    int top;
public:
    Stack() : top(-1) {}

    void push(T value) {
        if (top >= SIZE - 1) {
            throw "Stack overflow";
        }
        data[++top] = value;
    }

    T pop() {
        if (top < 0) {
            throw "Stack underflow";
        }
        return data[top--];
    }

    T peek() const {
        if (top < 0) {
            throw "Stack is empty";
        }
        return data[top];
    }

    bool isEmpty() const { return top == -1; }
    int size() const { return top + 1; }
};

template <typename K, typename V>
class Pair {
    K key;
    V value;
public:
    Pair(K k, V v) : key(k), value(v) {}
    K getKey() const { return key; }
    V getValue() const { return value; }
};

int main() {
    Stack<int, 10> intStack;
    intStack.push(1);
    intStack.push(2);
    intStack.push(3);

    while (!intStack.isEmpty()) {
        cout << intStack.pop() << " ";
    }
    cout << endl;

    Pair<string, int> p("age", 25);
    cout << p.getKey() << ": " << p.getValue() << endl;
    return 0;
}
