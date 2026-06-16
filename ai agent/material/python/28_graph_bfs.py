from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    result = []

    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result

def shortest_path(graph, start, end):
    visited = set()
    queue = deque([(start, [start])])
    visited.add(start)

    while queue:
        vertex, path = queue.popleft()
        if vertex == end:
            return path
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None

def has_cycle_undirected(graph):
    visited = set()
    for node in graph:
        if node not in visited:
            queue = deque([(node, None)])
            visited.add(node)
            while queue:
                vertex, parent = queue.popleft()
                for neighbor in graph[vertex]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, vertex))
                    elif neighbor != parent:
                        return True
    return False

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}
print(bfs(graph, 'A'))
print(shortest_path(graph, 'A', 'F'))
print(has_cycle_undirected(graph))
