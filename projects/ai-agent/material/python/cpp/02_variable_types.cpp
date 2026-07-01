#include <iostream>
#include <string>
using namespace std;

int main() {
    // 基本类型
    int age = 25;
    double height = 1.75;
    char grade = 'A';
    bool isPassed = true;
    string name = "Zhang San";

    // 输出
    cout << "Name: " << name << endl;
    cout << "Age: " << age << endl;
    cout << "Height: " << height << endl;

    // 类型转换
    double avg = 85.7;
    int rounded = (int)avg;
    cout << "Rounded: " << rounded << endl;

    return 0;
}
