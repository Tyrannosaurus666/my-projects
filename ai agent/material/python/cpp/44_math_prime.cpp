#include <iostream>
#include <cmath>
#include <vector>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

vector<int> generatePrimes(int limit) {
    vector<int> primes;
    for (int i = 2; i <= limit; i++) {
        if (isPrime(i)) primes.push_back(i);
    }
    return primes;
}

vector<int> sieveOfEratosthenes(int n) {
    vector<bool> isPrimeArr(n + 1, true);
    isPrimeArr[0] = isPrimeArr[1] = false;
    for (int i = 2; i * i <= n; i++) {
        if (isPrimeArr[i]) {
            for (int j = i * i; j <= n; j += i) {
                isPrimeArr[j] = false;
            }
        }
    }
    vector<int> primes;
    for (int i = 2; i <= n; i++) {
        if (isPrimeArr[i]) primes.push_back(i);
    }
    return primes;
}

int main() {
    cout << "97 is prime: " << isPrime(97) << endl;
    auto primes = generatePrimes(50);
    for (int p : primes) cout << p << " ";
    cout << endl;
    return 0;
}
