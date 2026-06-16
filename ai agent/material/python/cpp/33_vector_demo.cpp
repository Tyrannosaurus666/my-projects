#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> nums;

    nums.push_back(10);
    nums.push_back(20);
    nums.push_back(30);
    nums.insert(nums.begin(), 5);
    nums.insert(nums.begin() + 2, 15);

    cout << "Size: " << nums.size() << endl;
    cout << "Capacity: " << nums.capacity() << endl;

    for (int x : nums) cout << x << " ";
    cout << endl;

    nums.pop_back();
    nums.erase(nums.begin() + 1);

    sort(nums.begin(), nums.end(), greater<int>());
    for (int x : nums) cout << x << " ";
    cout << endl;

    auto it = find(nums.begin(), nums.end(), 15);
    if (it != nums.end()) {
        cout << "Found at index: " << distance(nums.begin(), it) << endl;
    }

    vector<int> doubled(nums.size());
    transform(nums.begin(), nums.end(), doubled.begin(),
              [](int x) { return x * 2; });

    for (int x : doubled) cout << x << " ";
    cout << endl;

    return 0;
}
