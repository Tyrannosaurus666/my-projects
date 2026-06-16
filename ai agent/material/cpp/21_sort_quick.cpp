#include <iostream>
using namespace std;

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int quickSelect(int arr[], int low, int high, int k) {
    if (low == high) return arr[low];
    int pi = partition(arr, low, high);
    if (pi == k) return arr[pi];
    if (pi > k) return quickSelect(arr, low, pi - 1, k);
    return quickSelect(arr, pi + 1, high, k);
}

int main() {
    int arr[] = {38, 27, 43, 3, 9, 82, 10};
    int n = sizeof(arr) / sizeof(arr[0]);
    quickSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;

    int arr2[] = {7, 10, 4, 3, 20, 15};
    cout << "3rd smallest: " << quickSelect(arr2, 0, 5, 2) << endl;
    return 0;
}
