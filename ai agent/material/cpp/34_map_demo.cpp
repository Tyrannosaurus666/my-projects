#include <iostream>
#include <map>
#include <unordered_map>
using namespace std;

int main() {
    // 有序map
    map<string, int> orderedMap;
    orderedMap["apple"] = 3;
    orderedMap["banana"] = 5;
    orderedMap["cherry"] = 2;

    for (const auto& kv : orderedMap) {
        cout << kv.first << ": " << kv.second << endl;
    }

    // 无序map - 性能更好
    unordered_map<string, int> scores;
    scores["Alice"] = 95;
    scores["Bob"] = 88;
    scores["Charlie"] = 92;

    string name = "Bob";
    if (scores.find(name) != scores.end()) {
        cout << name << "'s score: " << scores[name] << endl;
    }

    // 计数
    unordered_map<int, int> freq;
    int arr[] = {1, 2, 3, 2, 1, 3, 1, 4};
    for (int x : arr) freq[x]++;
    for (auto& kv : freq) {
        cout << kv.first << " appears " << kv.second << " times" << endl;
    }
    return 0;
}
