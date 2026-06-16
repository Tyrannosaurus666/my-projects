#include <iostream>
#include <vector>
#include <queue>
using namespace std;

class Graph {
    int V;
    vector<vector<int>> adj;

public:
    Graph(int vertices) : V(vertices), adj(vertices) {}

    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vector<int> bfs(int start) {
        vector<bool> visited(V, false);
        queue<int> q;
        vector<int> result;

        visited[start] = true;
        q.push(start);

        while (!q.empty()) {
            int v = q.front();
            q.pop();
            result.push_back(v);

            for (int neighbor : adj[v]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }
        return result;
    }

    void dfsUtil(int v, vector<bool>& visited, vector<int>& result) {
        visited[v] = true;
        result.push_back(v);
        for (int neighbor : adj[v]) {
            if (!visited[neighbor]) {
                dfsUtil(neighbor, visited, result);
            }
        }
    }

    vector<int> dfs(int start) {
        vector<bool> visited(V, false);
        vector<int> result;
        dfsUtil(start, visited, result);
        return result;
    }
};

int main() {
    Graph g(6);
    g.addEdge(0, 1); g.addEdge(0, 2);
    g.addEdge(1, 3); g.addEdge(1, 4);
    g.addEdge(2, 4); g.addEdge(3, 5);

    auto bfsResult = g.bfs(0);
    auto dfsResult = g.dfs(0);

    cout << "BFS: "; for (int v : bfsResult) cout << v << " "; cout << endl;
    cout << "DFS: "; for (int v : dfsResult) cout << v << " "; cout << endl;
    return 0;
}
