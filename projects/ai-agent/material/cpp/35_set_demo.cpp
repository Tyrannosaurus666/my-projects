#include <iostream>
#include <set>
#include <unordered_set>
using namespace std;

int main() {
    set<int> s;

    s.insert(5);
    s.insert(2);
    s.insert(8);
    s.insert(2);  // 重复，不会插入
    s.insert(1);

    for (int x : s) cout << x << " ";
    cout << endl;

    if (s.find(5) != s.end()) cout << "Found 5" << endl;
    s.erase(2);

    unordered_set<string> words;
    words.insert("apple");
    words.insert("banana");
    words.insert("cherry");

    cout << "Contains 'banana': " << (words.count("banana") > 0) << endl;

    set<int> a = {1, 2, 3, 4};
    set<int> b = {3, 4, 5, 6};

    set<int> uni;
    set_union(a.begin(), a.end(), b.begin(), b.end(),
              inserter(uni, uni.begin()));

    set<int> inter;
    set_intersection(a.begin(), a.end(), b.begin(), b.end(),
                     inserter(inter, inter.begin()));

    cout << "Union: ";
    for (int x : uni) cout << x << " ";
    cout << endl;

    cout << "Intersection: ";
    for (int x : inter) cout << x << " ";
    cout << endl;
    return 0;
}
