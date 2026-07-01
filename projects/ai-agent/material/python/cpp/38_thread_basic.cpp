#include <iostream>
#include <thread>
#include <vector>
using namespace std;

int sharedCounter = 0;

void incrementCounter(int times) {
    for (int i = 0; i < times; i++) {
        sharedCounter++;  // 非原子操作，存在竞态条件
    }
}

void worker(int id, int delay) {
    for (int i = 0; i < 3; i++) {
        this_thread::sleep_for(chrono::milliseconds(delay));
        cout << "Thread " << id << ": iteration " << i + 1 << endl;
    }
}

int main() {
    vector<thread> threads;

    for (int i = 0; i < 3; i++) {
        threads.push_back(thread(worker, i, 100));
    }

    for (auto& t : threads) {
        t.join();
    }

    vector<thread> counterThreads;
    for (int i = 0; i < 4; i++) {
        counterThreads.push_back(thread(incrementCounter, 100000));
    }
    for (auto& t : counterThreads) {
        t.join();
    }

    cout << "Shared counter (may be incorrect): " << sharedCounter << endl;
    return 0;
}
