#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

int sumArray(int arr[], int n) {
    if (n <= 0) return 0;
    return arr[n-1] + sumArray(arr, n-1);
}

void towerOfHanoi(int n, char from, char to, char aux) {
    if (n == 0) return;
    towerOfHanoi(n - 1, from, aux, to);
    cout << "Move disk " << n << " from " << from << " to " << to << endl;
    towerOfHanoi(n - 1, aux, to, from);
}

int main() {
    cout << "Factorial(5): " << factorial(5) << endl;
    cout << "Fibonacci(10): " << fibonacci(10) << endl;
    cout << "GCD(48,18): " << gcd(48, 18) << endl;

    int arr[] = {1, 2, 3, 4, 5};
    cout << "Sum: " << sumArray(arr, 5) << endl;

    towerOfHanoi(3, 'A', 'C', 'B');
    return 0;
}
