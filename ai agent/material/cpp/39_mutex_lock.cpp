#include <iostream>
#include <thread>
#include <mutex>
#include <vector>
using namespace std;

// 线程安全计数器
class SafeCounter {
    mutex mtx;
    int value;
public:
    SafeCounter() : value(0) {}

    void increment() {
        lock_guard<mutex> lock(mtx);
        value++;
    }

    int get() {
        lock_guard<mutex> lock(mtx);
        return value;
    }
};

void incrementCounter(SafeCounter& counter, int times) {
    for (int i = 0; i < times; i++) {
        counter.increment();
    }
}

// 死锁演示 - 注意：可能导致死锁
void deadlockDemo() {
    mutex mtx1, mtx2;

    thread t1([&]() {
        lock_guard<mutex> lock1(mtx1);
        this_thread::sleep_for(chrono::milliseconds(10));
        lock_guard<mutex> lock2(mtx2);
        cout << "Thread 1 got both locks" << endl;
    });

    thread t2([&]() {
        lock_guard<mutex> lock2(mtx2);
        this_thread::sleep_for(chrono::milliseconds(10));
        lock_guard<mutex> lock1(mtx1);
        cout << "Thread 2 got both locks" << endl;
    });

    t1.join();
    t2.join();
}

int main() {
    SafeCounter counter;
    vector<thread> threads;
    for (int i = 0; i < 4; i++) {
        threads.push_back(thread(incrementCounter, ref(counter), 100000));
    }
    for (auto& t : threads) t.join();
    cout << "Safe counter: " << counter.get() << endl;

    return 0;
}
