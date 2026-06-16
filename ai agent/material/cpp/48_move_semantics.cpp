#include <iostream>
#include <vector>
#include <cstring>
using namespace std;

// 动态字符串类
class MyString {
    char* data;
    size_t len;

public:
    MyString(const char* s) : len(strlen(s)) {
        data = new char[len + 1];
        strcpy(data, s);
        cout << "Constructed: " << data << endl;
    }

    // 拷贝构造
    MyString(const MyString& other) : len(other.len) {
        data = new char[len + 1];
        strcpy(data, other.data);
        cout << "Copied: " << data << endl;
    }

    // 移动构造
    MyString(MyString&& other) noexcept : data(other.data), len(other.len) {
        other.data = nullptr;
        other.len = 0;
        cout << "Moved: " << data << endl;
    }

    ~MyString() {
        if (data) {
            cout << "Destroyed: " << data << endl;
            delete[] data;
        }
    }

    const char* c_str() const { return data; }
};

int main() {
    MyString s1("Hello");
    MyString s2 = move(s1);  // 移动
    cout << "s2: " << s2.c_str() << endl;
    return 0;
}
