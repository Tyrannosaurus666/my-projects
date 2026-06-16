#include <iostream>
using namespace std;

int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

void findAll(int arr[], int n, int target, int result[], int& count) {
    count = 0;
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            result[count++] = i;
        }
    }
}

int findMax(int arr[], int n) {
    if (n <= 0) return -1;
    int maxVal = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > maxVal) maxVal = arr[i];
    }
    return maxVal;
}

int main() {
    int arr[] = {7, 3, 9, 1, 5, 3, 7, 2};
    int n = sizeof(arr) / sizeof(arr[0]);
    cout << "Found at: " << linearSearch(arr, n, 5) << endl;

    int indices[100], count;
    findAll(arr, n, 3, indices, count);
    for (int i = 0; i < count; i++) cout << indices[i] << " ";
    cout << endl;
    cout << "Max: " << findMax(arr, n) << endl;
    return 0;
}
