#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    vector<int> nums = {5, 2, 8, 1, 9, 3, 7, 4, 6};

    sort(nums.begin(), nums.end());
    for (int x : nums) cout << x << " ";
    cout << endl;

    sort(nums.begin(), nums.end(), greater<int>());
    for (int x : nums) cout << x << " ";
    cout << endl;

    nth_element(nums.begin(), nums.begin() + 2, nums.end());
    cout << "3rd smallest: " << nums[2] << endl;

    auto minIt = min_element(nums.begin(), nums.end());
    auto maxIt = max_element(nums.begin(), nums.end());
    cout << "Min: " << *minIt << ", Max: " << *maxIt << endl;

    int sum = accumulate(nums.begin(), nums.end(), 0);
    cout << "Sum: " << sum << endl;

    vector<int> squares(nums.size());
    transform(nums.begin(), nums.end(), squares.begin(),
              [](int x) { return x * x; });

    reverse(nums.begin(), nums.end());

    cout << boolalpha;
    cout << "Is sorted: " << is_sorted(nums.begin(), nums.end()) << endl;
    return 0;
}
