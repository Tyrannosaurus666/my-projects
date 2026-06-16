#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Observer {
public:
    virtual void update(const string& message) = 0;
    virtual ~Observer() {}
};

class Subject {
    vector<Observer*> observers;
public:
    void attach(Observer* obs) {
        observers.push_back(obs);
    }

    void detach(Observer* obs) {
        observers.erase(
            remove(observers.begin(), observers.end(), obs),
            observers.end()
        );
    }

    void notify(const string& message) {
        for (auto* obs : observers) {
            obs->update(message);
        }
    }
};

class NewsAgency : public Subject {
public:
    void publishNews(const string& news) {
        cout << "NewsAgency: " << news << endl;
        notify(news);
    }
};

class NewsReader : public Observer {
    string name;
public:
    NewsReader(string n) : name(n) {}
    void update(const string& message) override {
        cout << name << " received: " << message << endl;
    }
};

int main() {
    NewsAgency agency;
    NewsReader reader1("Alice");
    NewsReader reader2("Bob");

    agency.attach(&reader1);
    agency.attach(&reader2);

    agency.publishNews("Breaking: C++ is awesome!");

    agency.detach(&reader2);
    agency.publishNews("Update: Only Alice should see this.");
    return 0;
}
