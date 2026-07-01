#include <iostream>
using namespace std;

struct DNode {
    int data;
    DNode* prev;
    DNode* next;
    DNode(int val) : data(val), prev(nullptr), next(nullptr) {}
};

class DoublyLinkedList {
    DNode* head;
    DNode* tail;

public:
    DoublyLinkedList() : head(nullptr), tail(nullptr) {}

    // 尾部添加
    void pushBack(int data) {
        DNode* node = new DNode(data);
        if (!head) {
            head = tail = node;
        } else {
            tail->next = node;
            node->prev = tail;
            tail = node;
        }
    }

    void pushFront(int data) {
        DNode* node = new DNode(data);
        if (!head) {
            head = tail = node;
        } else {
            node->next = head;
            head->prev = node;
            head = node;
        }
    }

    void displayForward() {
        DNode* cur = head;
        while (cur) {
            cout << cur->data << " ";
            cur = cur->next;
        }
        cout << endl;
    }

    void displayBackward() {
        DNode* cur = tail;
        while (cur) {
            cout << cur->data << " ";
            cur = cur->prev;
        }
        cout << endl;
    }

    ~DoublyLinkedList() {
        while (head) {
            DNode* temp = head;
            head = head->next;
            delete temp;
        }
    }
};

int main() {
    DoublyLinkedList dll;
    dll.pushBack(1);
    dll.pushBack(2);
    dll.pushFront(0);
    dll.displayForward();
    dll.displayBackward();
    return 0;
}
