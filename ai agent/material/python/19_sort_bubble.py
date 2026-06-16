# 排序函数
def bubble_sort(arr):
    # 获取长度
    n = len(arr)
    # 循环
    for i in range(n):
        # 内循环
        for j in range(0, n-i-1):
            # 比较
            if arr[j] > arr[j+1]:
                # 交换
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def optimized_bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

data = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(data.copy()))
print(optimized_bubble_sort(data.copy()))
