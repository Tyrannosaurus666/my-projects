#include <iostream>
#include <stdexcept>
using namespace std;

// 除法函数
double divide(double a, double b) {
    if (b == 0) {
        throw runtime_error("Division by zero!");
    }
    return a / b;
}

int getElement(int arr[], int size, int index) {
    if (index < 0 || index >= size) {
        throw out_of_range("Index out of bounds");
    }
    return arr[index];
}

int main() {
    try {
        cout << divide(10, 2) << endl;
        cout << divide(10, 0) << endl;
    } catch (const runtime_error& e) {
        cerr << "Error: " << e.what() << endl;
    }

    int arr[] = {1, 2, 3, 4, 5};
    try {
        cout << getElement(arr, 5, 2) << endl;
        cout << getElement(arr, 5, 10) << endl;
    } catch (const out_of_range& e) {
        cerr << "Error: " << e.what() << endl;
    } catch (...) {
        cerr << "Unknown error" << endl;
    }

    return 0;
}
