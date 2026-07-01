#include <iostream>
#include <string>
using namespace std;

// 模板函数
template <typename T>
T maxOf(T a, T b) {
    return (a > b) ? a : b;
}

template <typename T>
void swapValues(T& a, T& b) {
    T temp = a;
    a = b;
    b = temp;
}

template <typename T>
void printArray(T arr[], int size) {
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
}

int main() {
    cout << maxOf(10, 20) << endl;
    cout << maxOf(3.14, 2.71) << endl;
    cout << maxOf(string("apple"), string("banana")) << endl;

    int x = 5, y = 10;
    swapValues(x, y);
    cout << "x=" << x << ", y=" << y << endl;

    int arr[] = {1, 2, 3, 4, 5};
    printArray(arr, 5);

    double darr[] = {1.1, 2.2, 3.3};
    printArray(darr, 3);
    return 0;
}
