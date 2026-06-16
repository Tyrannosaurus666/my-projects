/**
 * 应用主逻辑 —— 事件绑定、状态管理、流程控制。
 */

// ── 应用状态 ──────────────────────────────────────────────────────
const state = {
    files: [],           // 文件列表
    activeFileId: null,  // 当前选中文件 ID
    pollingTimers: {},   // {fileId: intervalId}
};

// ── 初始化 ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupUploadZone();
    setupFileListEvents();
    setupResultTabs();
    setupActionButtons();
    refreshFileList();
});

// ── 上传区域 ──────────────────────────────────────────────────────
function setupUploadZone() {
    const zone = document.getElementById('uploadZone');
    const input = document.getElementById('fileInput');

    // 点击触发文件选择
    zone.addEventListener('click', () => input.click());
    document.querySelector('.upload-link')?.addEventListener('click', (e) => {
        e.stopPropagation();
        input.click();
    });

    // 文件选择
    input.addEventListener('change', () => {
        handleFiles(input.files);
        input.value = '';
    });

    // 拖拽
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
}

async function handleFiles(fileList) {
    const files = Array.from(fileList).filter(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return ['py', 'cpp', 'cc', 'cxx', 'hpp'].includes(ext);
    });

    if (files.length === 0) {
        showToast('请选择 .py 或 .cpp 文件', 'error');
        return;
    }

    for (const file of files) {
        try {
            showToast(`正在上传: ${file.name}`, 'info');
            const result = await uploadFile(file);
            state.files.push({
                file_id: result.file_id,
                filename: result.filename,
                language: result.language,
                status: 'uploaded',
            });
            showToast(`${file.name} 上传成功`, 'success');
        } catch (err) {
            showToast(`上传失败: ${err.message}`, 'error');
        }
    }

    renderFileList(state.files, state.activeFileId);
    rebindFileItems();
}

// ── 文件列表事件 ──────────────────────────────────────────────────
function setupFileListEvents() {
    document.getElementById('fileList').addEventListener('click', (e) => {
        const fileItem = e.target.closest('.file-item');
        if (!fileItem) return;

        const fileId = fileItem.dataset.fileId;

        // 删除按钮
        if (e.target.closest('.file-delete')) {
            handleDeleteFile(fileId);
            return;
        }

        // 选中文件
        handleSelectFile(fileId);
    });
}

function rebindFileItems() {
    // 重新绑定在 renderFileList 之后不需要额外操作，
    // 因为事件委托在父容器上。
}

async function handleSelectFile(fileId) {
    state.activeFileId = fileId;

    // 高亮当前项
    document.querySelectorAll('.file-item').forEach(el => {
        el.classList.toggle('active', el.dataset.fileId === fileId);
    });

    const file = state.files.find(f => f.file_id === fileId);
    if (!file) return;

    // 如果已完成分析，加载结果
    if (file.status === 'completed') {
        try {
            const result = await getAnalysisResult(fileId);
            renderResult(result);
        } catch (err) {
            showToast(`加载结果失败: ${err.message}`, 'error');
        }
    } else if (file.status === 'analyzing') {
        // 显示等待状态
        showToast('分析进行中，完成后自动刷新...', 'info');
    } else {
        // 未分析，触发单个分析
        await handleAnalyzeSingle(fileId);
    }
}

async function handleDeleteFile(fileId) {
    try {
        await deleteFile(fileId);
        state.files = state.files.filter(f => f.file_id !== fileId);
        stopPolling(fileId);

        if (state.activeFileId === fileId) {
            state.activeFileId = null;
            clearResult();
        }

        renderFileList(state.files, state.activeFileId);
        showToast('文件已删除', 'success');
    } catch (err) {
        showToast(`删除失败: ${err.message}`, 'error');
    }
}

// ── 分析流程 ──────────────────────────────────────────────────────
async function handleAnalyzeSingle(fileId) {
    const file = state.files.find(f => f.file_id === fileId);
    if (!file || file.status === 'analyzing') return;

    try {
        showToast(`开始分析: ${file.filename}`, 'info');
        await triggerAnalysis(fileId);
        file.status = 'analyzing';
        renderFileList(state.files, state.activeFileId);
        rebindFileItems();

        // 开始轮询
        startPolling(fileId);
    } catch (err) {
        file.status = 'error';
        renderFileList(state.files, state.activeFileId);
        showToast(`分析失败: ${err.message}`, 'error');
    }
}

async function handleAnalyzeAll() {
    const pending = state.files.filter(f => f.status === 'uploaded');
    if (pending.length === 0) {
        showToast('没有待分析的文件', 'info');
        return;
    }

    showToast(`开始分析 ${pending.length} 个文件...`, 'info');

    for (const file of pending) {
        try {
            await triggerAnalysis(file.file_id);
            file.status = 'analyzing';
        } catch (err) {
            file.status = 'error';
            showToast(`${file.filename} 分析失败: ${err.message}`, 'error');
        }
    }

    renderFileList(state.files, state.activeFileId);
    rebindFileItems();

    // 为所有 analyzing 状态的文件启动轮询
    state.files.forEach(f => {
        if (f.status === 'analyzing') startPolling(f.file_id);
    });
}

// ── 轮询 ──────────────────────────────────────────────────────────
function startPolling(fileId) {
    if (state.pollingTimers[fileId]) return;

    state.pollingTimers[fileId] = setInterval(async () => {
        try {
            const status = await getAnalysisStatus(fileId);

            if (status.status === 'completed') {
                stopPolling(fileId);
                const file = state.files.find(f => f.file_id === fileId);
                if (file) {
                    file.status = 'completed';
                    renderFileList(state.files, state.activeFileId);
                    rebindFileItems();
                    showToast(`${file.filename} 分析完成`, 'success');

                    // 如果当前选中该文件，自动加载结果
                    if (state.activeFileId === fileId) {
                        const result = await getAnalysisResult(fileId);
                        renderResult(result);
                    }
                }
            } else {
                // 更新部分状态
                const file = state.files.find(f => f.file_id === fileId);
                if (file) {
                    file._astDone = status.ast_done;
                    file._llmDone = status.llm_done;
                }
            }
        } catch (err) {
            stopPolling(fileId);
            const file = state.files.find(f => f.file_id === fileId);
            if (file) {
                file.status = 'error';
                renderFileList(state.files, state.activeFileId);
                rebindFileItems();
            }
        }
    }, 1500);
}

function stopPolling(fileId) {
    if (state.pollingTimers[fileId]) {
        clearInterval(state.pollingTimers[fileId]);
        delete state.pollingTimers[fileId];
    }
}

// ── 结果标签切换 ──────────────────────────────────────────────────
function setupResultTabs() {
    document.querySelector('.tabs')?.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (!tab) return;

        // 切换 active
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 切换内容
        const target = tab.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(target === 'ast' ? 'tabAST' : 'tabLLM').classList.add('active');
    });
}

// ── 操作按钮 ──────────────────────────────────────────────────────
function setupActionButtons() {
    document.getElementById('btnAnalyzeAll')?.addEventListener('click', handleAnalyzeAll);
    document.getElementById('btnClearAll')?.addEventListener('click', handleClearAll);

    document.getElementById('btnDownloadAST')?.addEventListener('click', () => handleDownload('ast'));
    document.getElementById('btnDownloadLLM')?.addEventListener('click', () => handleDownload('llm'));
}

async function handleClearAll() {
    if (state.files.length === 0) return;
    try {
        await clearAllFiles();
        // 停止所有轮询
        Object.keys(state.pollingTimers).forEach(stopPolling);
        state.files = [];
        state.activeFileId = null;
        renderFileList([], null);
        clearResult();
        showToast('已清空所有文件', 'success');
    } catch (err) {
        showToast(`清空失败: ${err.message}`, 'error');
    }
}

async function handleDownload(type) {
    const fileId = window._currentFileId;
    if (!fileId) {
        showToast('请先选择一个已分析的文件', 'error');
        return;
    }

    const file = state.files.find(f => f.file_id === fileId);
    const originalName = file ? file.filename : 'code';
    const suffix = file?.language === 'python' ? '.py' : '.cpp';
    const baseName = originalName.replace(/\.\w+$/, '');
    const downloadName = `${baseName}_${type}_annotated${suffix}`;

    try {
        const blob = await downloadAnnotatedCode(fileId, type);
        triggerDownload(blob, downloadName);
        showToast(`下载完成: ${downloadName}`, 'success');
    } catch (err) {
        showToast(`下载失败: ${err.message}`, 'error');
    }
}

// ── 刷新文件列表 ──────────────────────────────────────────────────
async function refreshFileList() {
    try {
        const data = await listFiles();
        if (data.files) {
            state.files = data.files;
            renderFileList(state.files, state.activeFileId);
            rebindFileItems();

            // 恢复轮询（分析中的文件）
            state.files.forEach(f => {
                if (f.status === 'analyzing') startPolling(f.file_id);
            });
        }
    } catch (err) {
        // 后端未启动时静默失败
        console.warn('刷新文件列表失败:', err.message);
    }
}
