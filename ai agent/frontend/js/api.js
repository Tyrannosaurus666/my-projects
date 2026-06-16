/**
 * API 调用封装 —— 与后端 FastAPI 通信。
 */
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:8001' : '';

/**
 * 通用 fetch 封装，自动处理 JSON 响应和错误。
 */
async function apiRequest(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, options);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `请求失败: ${res.status}`);
    }
    // 检查 Content-Type，如果是 JSON 就解析，否则返回 text
    const ct = res.headers.get('Content-Type') || '';
    if (ct.includes('application/json')) {
        return res.json();
    }
    return res.text();
}

/**
 * 上传代码文件。
 * @param {File} file - 文件对象
 * @returns {Promise<{file_id, filename, language, status}>}
 */
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/upload', { method: 'POST', body: formData });
}

/**
 * 触发分析任务。
 * @param {string} fileId - 文件 ID
 */
async function triggerAnalysis(fileId) {
    return apiRequest(`/analyze/${fileId}`, { method: 'POST' });
}

/**
 * 查询分析进度。
 * @param {string} fileId
 * @returns {Promise<{status, ast_done, llm_done}>}
 */
async function getAnalysisStatus(fileId) {
    return apiRequest(`/analyze/${fileId}/status`);
}

/**
 * 获取分析结果。
 * @param {string} fileId
 * @returns {Promise<{ast_result, llm_result}>}
 */
async function getAnalysisResult(fileId) {
    return apiRequest(`/result/${fileId}`);
}

/**
 * 下载带注释代码。
 * @param {string} fileId
 * @param {string} type - "ast" 或 "llm"
 * @returns {Promise<Blob>}
 */
async function downloadAnnotatedCode(fileId, type = 'llm') {
    const url = `${API_BASE}/download/${fileId}?type=${type}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('下载失败');
    return res.blob();
}

/**
 * 获取文件列表。
 */
async function listFiles() {
    return apiRequest('/files');
}

/**
 * 删除单个文件。
 * @param {string} fileId
 */
async function deleteFile(fileId) {
    return apiRequest(`/files/${fileId}`, { method: 'DELETE' });
}

/**
 * 清空所有文件。
 */
async function clearAllFiles() {
    return apiRequest('/files', { method: 'DELETE' });
}
