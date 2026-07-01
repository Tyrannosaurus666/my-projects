#include <iostream>
using namespace std;

class Base {
public:
    Base() { cout << "Base constructor" << endl; }
    virtual ~Base() { cout << "Base destructor" << endl; }
    virtual void doWork() { cout << "Base work" << endl; }
};

class Derived : public Base {
    int* data;
public:
    Derived() {
        data = new int[100];
        cout << "Derived constructor" << endl;
    }
    ~Derived() {
        delete[] data;
        cout << "Derived destructor" << endl;
    }
    void doWork() override { cout << "Derived work" << endl; }
};

class ResourceHolder {
    string name;
public:
    ResourceHolder(string n) : name(n) {
        cout << "Resource " << name << " acquired" << endl;
    }
    ~ResourceHolder() {
        cout << "Resource " << name << " released" << endl;
    }
};

void processBase(Base* b) {
    b->doWork();
}

void riskyFunction() {
    ResourceHolder rh("FileHandle");
    Base* ptr = new Derived();
    processBase(ptr);
    delete ptr;
    // 如果析构函数不是virtual，Derived的析构不会被调用！
}

int main() {
    riskyFunction();
    cout << "Program end" << endl;
    return 0;
}
