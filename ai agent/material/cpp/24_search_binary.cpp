#include <iostream>
using namespace std;

// 二分查找
int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// 查找第一个出现位置
int binarySearchFirst(int arr[], int n, int target) {
    int left = 0, right = n;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] < target) left = mid + 1;
        else right = mid;
    }
    if (left < n && arr[left] == target) return left;
    return -1;
}

int main() {
    int arr[] = {1, 3, 5, 5, 5, 7, 9, 11};
    int n = sizeof(arr) / sizeof(arr[0]);
    cout << binarySearch(arr, n, 7) << endl;
    cout << binarySearchFirst(arr, n, 5) << endl;
    return 0;
}
