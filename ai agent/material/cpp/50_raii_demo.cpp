#include <iostream>
#include <fstream>
using namespace std;

// RAII 文件管理
class FileGuard {
    FILE* file;
public:
    FileGuard(const char* filename, const char* mode) {
        file = fopen(filename, mode);
        if (file) cout << "File opened" << endl;
    }

    void write(const char* text) {
        if (file) fprintf(file, "%s", text);
    }

    ~FileGuard() {
        if (file) {
            fclose(file);
            cout << "File closed" << endl;
        }
    }

    // 禁止拷贝
    FileGuard(const FileGuard&) = delete;
    FileGuard& operator=(const FileGuard&) = delete;
};

// RAII 互斥锁包装
class MutexGuard {
    bool& locked;
public:
    MutexGuard(bool& lock) : locked(lock) {
        locked = true;
        cout << "Lock acquired" << endl;
    }
    ~MutexGuard() {
        locked = false;
        cout << "Lock released" << endl;
    }
};

void processWithFile() {
    FileGuard fg("raii_test.txt", "w");
    fg.write("RAII ensures cleanup!\n");
    // 即使此处抛出异常，文件也会被正确关闭
}

int main() {
    processWithFile();

    bool lock = false;
    {
        MutexGuard guard(lock);
        cout << "Critical section, locked=" << lock << endl;
    }
    cout << "After scope, locked=" << lock << endl;
    return 0;
}
