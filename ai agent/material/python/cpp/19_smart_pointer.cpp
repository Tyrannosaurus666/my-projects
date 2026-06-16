#include <iostream>
#include <memory>
using namespace std;

class Resource {
    string name;
public:
    Resource(string n) : name(n) {
        cout << "Resource " << name << " created" << endl;
    }
    ~Resource() {
        cout << "Resource " << name << " destroyed" << endl;
    }
    void use() { cout << "Using " << name << endl; }
};

// unique_ptr 演示
void uniquePtrDemo() {
    auto res = make_unique<Resource>("UniqueRes");
    res->use();
    // 自动释放
}

// shared_ptr 演示
void sharedPtrDemo() {
    auto res1 = make_shared<Resource>("SharedRes");
    {
        auto res2 = res1;
        cout << "Reference count: " << res1.use_count() << endl;
        res2->use();
    }
    cout << "After inner block: " << res1.use_count() << endl;
}

int main() {
    uniquePtrDemo();
    sharedPtrDemo();
    return 0;
}
