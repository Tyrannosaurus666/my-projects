#include <iostream>
using namespace std;

class Singleton {
private:
    static Singleton* instance;
    int data;

    Singleton() : data(0) {}
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;

public:
    static Singleton* getInstance() {
        if (!instance) {
            instance = new Singleton();
        }
        return instance;
    }

    void setData(int d) { data = d; }
    int getData() const { return data; }

    static void destroy() {
        if (instance) {
            delete instance;
            instance = nullptr;
        }
    }
};

Singleton* Singleton::instance = nullptr;

int main() {
    Singleton* s1 = Singleton::getInstance();
    s1->setData(42);

    Singleton* s2 = Singleton::getInstance();
    cout << "s2 data: " << s2->getData() << endl;
    cout << "Same instance: " << (s1 == s2) << endl;

    Singleton::destroy();
    return 0;
}
