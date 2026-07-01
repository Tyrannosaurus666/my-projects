#include <iostream>
#include <string>
#include <cstring>
using namespace std;

int main() {
    string s1 = "Hello";
    string s2 = "World";
    string s3 = s1 + " " + s2;

    cout << s3 << endl;
    cout << "Length: " << s3.length() << endl;
    cout << "Substr: " << s3.substr(0, 5) << endl;

    size_t pos = s3.find("World");
    if (pos != string::npos) {
        cout << "Found at: " << pos << endl;
    }

    s3.replace(6, 5, "C++");
    cout << "Replaced: " << s3 << endl;

    char cstr[50];
    strcpy(cstr, s3.c_str());
    cout << "C-string: " << cstr << endl;

    char* ptr = nullptr;
    // 潜在空指针风险
    // cout << strlen(ptr) << endl;

    return 0;
}
