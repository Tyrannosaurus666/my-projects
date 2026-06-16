#include <iostream>
#include <string>
using namespace std;

// 学生类
class Student {
private:
    string name;
    int age;
    double score;

public:
    Student(string n, int a, double s) {
        name = n;
        age = a;
        score = s;
    }

    // getter
    string getName() { return name; }
    int getAge() { return age; }
    double getScore() { return score; }

    void setScore(double s) {
        if (s >= 0 && s <= 100) {
            score = s;
        }
    }

    void display() {
        cout << "Name: " << name << ", Age: " << age
             << ", Score: " << score << endl;
    }
};

int main() {
    Student s("Li Ming", 20, 88.5);
    s.display();
    s.setScore(92.0);
    s.display();
    return 0;
}
