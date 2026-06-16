#include <iostream>
using namespace std;

int main() {
    int x = 42;
    int* ptr = &x;

    cout << "Value: " << *ptr << endl;
    cout << "Address: " << ptr << endl;

    *ptr = 100;
    cout << "New value: " << x << endl;

    int arr[] = {10, 20, 30, 40, 50};
    int* arrPtr = arr;
    for (int i = 0; i < 5; i++) {
        cout << *(arrPtr + i) << " ";
    }
    cout << endl;

    int* dynamicInt = new int(99);
    cout << "Dynamic: " << *dynamicInt << endl;
    delete dynamicInt;

    int* nullPtr = nullptr;
    // 潜在空指针解引用风险
    // cout << *nullPtr << endl;

    int a = 5, b = 10;
    int* pa = &a;
    int* pb = &b;
    int* temp = pa;
    pa = pb;
    pb = temp;
    cout << "a=" << *pa << ", b=" << *pb << endl;

    return 0;
}
