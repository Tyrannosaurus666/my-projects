#include <iostream>
#include <string>
using namespace std;

class Animal {
protected:
    string name;

public:
    Animal(string n) : name(n) {}
    virtual void speak() {
        cout << name << " makes a sound" << endl;
    }
    virtual ~Animal() {}
};

class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}
    void speak() override {
        cout << name << " says: Woof!" << endl;
    }
    void fetch() {
        cout << name << " fetches the ball" << endl;
    }
};

class Cat : public Animal {
public:
    Cat(string n) : Animal(n) {}
    void speak() override {
        cout << name << " says: Meow!" << endl;
    }
};

int main() {
    Animal* animals[3];
    animals[0] = new Dog("Buddy");
    animals[1] = new Cat("Kitty");
    animals[2] = new Dog("Max");

    for (int i = 0; i < 3; i++) {
        animals[i]->speak();
    }

    for (int i = 0; i < 3; i++) {
        delete animals[i];
    }

    return 0;
}
