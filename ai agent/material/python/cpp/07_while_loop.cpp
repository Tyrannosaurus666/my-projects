#include <iostream>
using namespace std;

int main() {
    // 循环
    int n = 10;
    while (n > 0) {
        cout << n << " ";
        n--;
    }
    cout << endl;

    // 求和
    int i = 1, sum = 0;
    while (i <= 50) {
        sum += i;
        i++;
    }
    cout << "Sum: " << sum << endl;

    // 判断素数
    int num = 29;
    bool isPrime = true;
    int divisor = 2;
    while (divisor * divisor <= num) {
        if (num % divisor == 0) {
            isPrime = false;
            break;
        }
        divisor++;
    }
    cout << num << (isPrime ? " is prime" : " is not prime") << endl;

    return 0;
}
