#include <iostream>
using namespace std;

int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

int lcm(int a, int b) {
    return (a / gcd(a, b)) * b;
}

int gcdArray(int arr[], int n) {
    int result = arr[0];
    for (int i = 1; i < n; i++) {
        result = gcd(result, arr[i]);
    }
    return result;
}

int extendedGCD(int a, int b, int& x, int& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    int x1, y1;
    int g = extendedGCD(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

int main() {
    cout << "GCD(48,18): " << gcd(48, 18) << endl;
    cout << "LCM(12,18): " << lcm(12, 18) << endl;

    int arr[] = {24, 36, 48, 60};
    cout << "GCD of array: " << gcdArray(arr, 4) << endl;

    int x, y;
    int g = extendedGCD(30, 20, x, y);
    cout << "Extended GCD: " << g << ", x=" << x << ", y=" << y << endl;
    return 0;
}
