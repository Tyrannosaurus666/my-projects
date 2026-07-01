#include <iostream>
#include <list>
using namespace std;

// 哈希表实现
class HashTable {
    static const int SIZE = 10;
    list<pair<int, string>> table[SIZE];

    int hash(int key) { return key % SIZE; }

public:
    void put(int key, string value) {
        int idx = hash(key);
        for (auto& kv : table[idx]) {
            if (kv.first == key) {
                kv.second = value;
                return;
            }
        }
        table[idx].push_back({key, value});
    }

    string get(int key) {
        int idx = hash(key);
        for (auto& kv : table[idx]) {
            if (kv.first == key) return kv.second;
        }
        return "Not found";
    }

    void remove(int key) {
        int idx = hash(key);
        table[idx].remove_if([key](const auto& kv) { return kv.first == key; });
    }

    void display() {
        for (int i = 0; i < SIZE; i++) {
            cout << i << ": ";
            for (auto& kv : table[i]) {
                cout << "(" << kv.first << "," << kv.second << ") ";
            }
            cout << endl;
        }
    }
};

int main() {
    HashTable ht;
    ht.put(1, "Alice");
    ht.put(11, "Bob");
    ht.put(21, "Charlie");
    ht.display();
    cout << "Key 11: " << ht.get(11) << endl;
    return 0;
}
