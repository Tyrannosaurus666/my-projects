#include <iostream>
#include <sstream>
#include <string>
using namespace std;

int main() {
    // ostringstream - 构建字符串
    ostringstream oss;
    oss << "Value: " << 42 << ", Pi: " << 3.14159;
    string result = oss.str();
    cout << result << endl;

    // istringstream - 解析字符串
    string input = "John 25 180.5";
    istringstream iss(input);
    string name;
    int age;
    double height;
    iss >> name >> age >> height;
    cout << name << " is " << age << ", " << height << "cm" << endl;

    // 字符串分割
    string csv = "apple,banana,cherry,date";
    istringstream csvStream(csv);
    string token;
    while (getline(csvStream, token, ',')) {
        cout << token << " ";
    }
    cout << endl;

    // 类型转换
    string numStr = "12345";
    int num;
    istringstream(numStr) >> num;
    cout << "Converted: " << num * 2 << endl;

    return 0;
}
