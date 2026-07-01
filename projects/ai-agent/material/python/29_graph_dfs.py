# DFS 遍历
def dfs_recursive(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    result = [node]
    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            result.extend(dfs_recursive(graph, neighbor, visited))
    return result

def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    result = []
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            result.append(node)
            for neighbor in reversed(graph.get(node, [])):
                if neighbor not in visited:
                    stack.append(neighbor)
    return result

# 拓扑排序
def topological_sort(graph):
    visited = set()
    temp = set()
    order = []

    def dfs(v):
        if v in temp:
            return False
        if v in visited:
            return True
        temp.add(v)
        for neighbor in graph.get(v, []):
            if not dfs(neighbor):
                return False
        temp.remove(v)
        visited.add(v)
        order.append(v)
        return True

    for node in graph:
        if node not in visited:
            if not dfs(node):
                return None
    return order[::-1]

dag = {'A': ['C'], 'B': ['C', 'D'], 'C': ['E'], 'D': ['F'], 'E': ['F'], 'F': []}
print(dfs_recursive(dag, 'A'))
print(dfs_iterative(dag, 'A'))
print(topological_sort(dag))
