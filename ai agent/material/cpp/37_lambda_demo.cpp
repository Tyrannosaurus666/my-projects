#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // 基本lambda
    auto add = [](int a, int b) -> int { return a + b; };
    cout << "add(3,5): " << add(3, 5) << endl;

    // 捕获外部变量
    int multiplier = 10;
    auto multiply = [multiplier](int x) { return x * multiplier; };
    cout << "multiply(5): " << multiply(5) << endl;

    // 引用捕获
    int counter = 0;
    auto increment = [&counter]() { counter++; };
    increment(); increment(); increment();
    cout << "counter: " << counter << endl;

    // 结合STL
    vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

    nums.erase(remove_if(nums.begin(), nums.end(),
                         [](int x) { return x % 2 == 0; }),
               nums.end());

    for_each(nums.begin(), nums.end(),
             [](int& x) { x *= 2; });

    for (int x : nums) cout << x << " ";
    cout << endl;

    // 泛型lambda (C++14)
    auto genericAdd = [](auto a, auto b) { return a + b; };
    cout << genericAdd(1, 2) << endl;
    cout << genericAdd(string("Hello "), string("World")) << endl;
    return 0;
}
