# 除法函数
def safe_divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print("错误: 不能除以零")
        return None
    except TypeError:
        print("错误: 参数类型不正确")
        return None

def read_number_from_file(filename):
    try:
        with open(filename, 'r') as f:
            content = f.read().strip()
            return int(content)
    except FileNotFoundError:
        print(f"文件 {filename} 不存在")
        return None
    except ValueError:
        print("文件内容不是有效数字")
        return None

def process_list(data, index):
    try:
        return data[index]
    except IndexError:
        print(f"索引 {index} 超出范围")
        return None

# 测试
print(safe_divide(10, 2))
print(safe_divide(10, 0))
print(safe_divide("a", 2))
