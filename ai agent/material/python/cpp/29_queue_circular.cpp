#include <iostream>
using namespace std;

// 循环队列
class CircularQueue {
    int* arr;
    int front, rear, capacity, count;

public:
    CircularQueue(int size) : capacity(size), front(0), rear(0), count(0) {
        arr = new int[capacity];
    }

    bool enqueue(int x) {
        if (count == capacity) return false;
        arr[rear] = x;
        rear = (rear + 1) % capacity;
        count++;
        return true;
    }

    int dequeue() {
        if (count == 0) throw "Queue is empty";
        int x = arr[front];
        front = (front + 1) % capacity;
        count--;
        return x;
    }

    int getFront() {
        if (count == 0) throw "Queue is empty";
        return arr[front];
    }

    bool isEmpty() { return count == 0; }
    int size() { return count; }

    ~CircularQueue() { delete[] arr; }
};

int main() {
    CircularQueue q(5);
    q.enqueue(1);
    q.enqueue(2);
    q.enqueue(3);
    cout << q.dequeue() << endl;
    cout << q.getFront() << endl;
    return 0;
}
