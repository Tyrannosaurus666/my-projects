#include <iostream>
#include <string>
using namespace std;

int add(int a, int b) {
    return a + b;
}

double add(double a, double b) {
    return a + b;
}

string add(string a, string b) {
    return a + b;
}

int add(int a, int b, int c) {
    return a + b + c;
}

void print(int x) {
    cout << "Integer: " << x << endl;
}

void print(double x) {
    cout << "Double: " << x << endl;
}

void print(string x) {
    cout << "String: " << x << endl;
}

int main() {
    cout << add(3, 5) << endl;
    cout << add(2.5, 3.7) << endl;
    cout << add(string("Hello "), string("World")) << endl;
    cout << add(1, 2, 3) << endl;

    print(42);
    print(3.14);
    print("C++");
    return 0;
}
