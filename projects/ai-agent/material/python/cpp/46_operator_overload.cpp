#include <iostream>
using namespace std;

// 复数类
class Complex {
    double real, imag;
public:
    Complex(double r = 0, double i = 0) : real(r), imag(i) {}

    // 运算符重载
    Complex operator+(const Complex& other) const {
        return Complex(real + other.real, imag + other.imag);
    }

    Complex operator-(const Complex& other) const {
        return Complex(real - other.real, imag - other.imag);
    }

    Complex operator*(const Complex& other) const {
        return Complex(real * other.real - imag * other.imag,
                       real * other.imag + imag * other.real);
    }

    bool operator==(const Complex& other) const {
        return real == other.real && imag == other.imag;
    }

    friend ostream& operator<<(ostream& os, const Complex& c) {
        os << c.real;
        if (c.imag >= 0) os << "+";
        os << c.imag << "i";
        return os;
    }
};

int main() {
    Complex c1(3, 4), c2(1, -2);
    cout << "c1: " << c1 << endl;
    cout << "c2: " << c2 << endl;
    cout << "c1 + c2: " << c1 + c2 << endl;
    cout << "c1 - c2: " << c1 - c2 << endl;
    cout << "c1 * c2: " << c1 * c2 << endl;
    return 0;
}
