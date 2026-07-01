#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    ofstream outFile("sample.txt");
    outFile << "Line 1: Hello C++" << endl;
    outFile << "Line 2: File I/O" << endl;
    outFile << "Line 3: Testing" << endl;
    outFile.close();

    ifstream inFile("sample.txt");
    string line;
    while (getline(inFile, line)) {
        cout << line << endl;
    }
    inFile.close();

    ofstream appendFile("sample.txt", ios::app);
    appendFile << "Line 4: Appended content" << endl;
    appendFile.close();

    ifstream binaryFile("sample.txt", ios::binary);
    if (binaryFile.is_open()) {
        binaryFile.seekg(0, ios::end);
        streampos size = binaryFile.tellg();
        cout << "File size: " << size << " bytes" << endl;
        binaryFile.close();
    }

    // 注意：某些场景下文件可能未关闭导致资源泄漏

    return 0;
}
