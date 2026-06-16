def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

def find_all_occurrences(arr, target):
    indices = []
    for i, val in enumerate(arr):
        if val == target:
            indices.append(i)
    return indices

def find_min_max(arr):
    if not arr:
        return None, None
    min_val = max_val = arr[0]
    for val in arr:
        if val < min_val:
            min_val = val
        if val > max_val:
            max_val = val
    return min_val, max_val

def find_kth_smallest(arr, k):
    sorted_arr = sorted(arr)
    return sorted_arr[k - 1] if 0 < k <= len(sorted_arr) else None

data = [7, 3, 9, 1, 5, 3, 7, 2]
print(linear_search(data, 5))
print(find_all_occurrences(data, 3))
print(find_min_max(data))
print(find_kth_smallest(data, 3))
