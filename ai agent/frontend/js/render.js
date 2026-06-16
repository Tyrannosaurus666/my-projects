/**
 * 渲染函数 —— DOM 更新、代码高亮、通知。
 */

// ── 代码高亮 ─────────────────────────────────────────────────────

/**
 * 高亮代码块。
 * @param {string} code - 源代码
 * @param {string} language - "python" 或 "cpp"
 * @returns {string} HTML 字符串
 */
function highlightCode(code, language) {
    const lang = language === 'python' ? 'python' : 'cpp';
    if (typeof hljs !== 'undefined') {
        try {
            const result = hljs.highlight(code, { language: lang });
            return result.value;
        } catch (e) {
            // 回退：HTML 转义
            return escapeHtml(code);
        }
    }
    return escapeHtml(code);
}

/**
 * HTML 转义。
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── 文件列表渲染 ─────────────────────────────────────────────────

/**
 * 渲染文件列表。
 * @param {Array} files - 文件信息数组
 * @param {string|null} activeId - 当前选中的文件 ID
 */
function renderFileList(files, activeId = null) {
    const container = document.getElementById('fileList');
    const countEl = document.getElementById('fileCount');
    const analyzeBtn = document.getElementById('btnAnalyzeAll');

    countEl.textContent = files.length;
    analyzeBtn.disabled = files.length === 0;

    if (files.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无文件，请上传代码</div>';
        return;
    }

    container.innerHTML = files.map(file => {
        const langClass = file.language === 'python' ? 'py' : 'cpp';
        const isActive = file.file_id === activeId ? ' active' : '';
        return `
            <div class="file-item${isActive}" data-file-id="${file.file_id}">
                <div class="file-icon ${langClass}">${langClass.toUpperCase()}</div>
                <div class="file-info">
                    <div class="file-name" title="${escapeHtml(file.filename)}">${escapeHtml(file.filename)}</div>
                    <div class="file-meta">${file.language}</div>
                </div>
                <span class="file-status ${file.status}">${statusLabel(file.status)}</span>
                <button class="file-delete" title="删除">×</button>
            </div>
        `;
    }).join('');
}

function statusLabel(status) {
    const map = { uploaded: '待分析', analyzing: '分析中', completed: '已完成', error: '失败' };
    return map[status] || status;
}

// ── 结果渲染 ─────────────────────────────────────────────────────

/**
 * 渲染分析结果。
 * @param {object} result - API 返回的完整结果
 */
function renderResult(result) {
    const placeholder = document.getElementById('resultPlaceholder');
    const content = document.getElementById('resultContent');
    const lang = result.language || 'python';

    placeholder.style.display = 'none';
    content.style.display = 'flex';

    document.getElementById('resultFileName').textContent = result.filename || '-';
    document.getElementById('resultLang').textContent = lang;

    // 渲染 AST 结果
    renderASTResult(result.ast_result, lang);

    // 渲染 LLM 结果
    renderLLMResult(result.llm_result, lang);

    // 设置下载链接
    window._currentFileId = result.file_id;
}

/**
 * 渲染 AST 分析结果。
 */
function renderASTResult(astResult, lang) {
    const statusEl = document.getElementById('astStatus');
    const codeEl = document.getElementById('astCode');

    if (!astResult || astResult.error) {
        statusEl.textContent = astResult?.error || '暂无数据';
        statusEl.style.color = '#dc2626';
        codeEl.innerHTML = '';
        return;
    }

    // 如果是字符串（注释后代码），直接高亮
    if (typeof astResult === 'string') {
        statusEl.textContent = '分析完成';
        statusEl.style.color = '#16a34a';
        codeEl.innerHTML = highlightCode(astResult, lang);
    } else {
        // 结构化结果，显示摘要
        const summary = astResult.summary || '分析完成';
        statusEl.textContent = summary;
        statusEl.style.color = '#16a34a';

        // 将结构化结果格式化为可读文本
        let text = '# === AST 结构分析结果 ===\n';
        text += `# ${summary}\n\n`;

        if (astResult.functions && astResult.functions.length > 0) {
            text += '# --- 函数列表 ---\n';
            for (const f of astResult.functions) {
                text += `# ${f.name}(${f.args?.join(', ') || ''}) 行 ${f.lineno}`;
                if (f.is_recursive) text += ' [递归]';
                text += '\n';
            }
        }
        if (astResult.classes && astResult.classes.length > 0) {
            text += '\n# --- 类列表 ---\n';
            for (const c of astResult.classes) {
                text += `# ${c.name}(行 ${c.lineno}) 方法: ${c.methods?.join(', ') || '无'}\n`;
            }
        }
        if (astResult.branches && astResult.branches.length > 0) {
            text += `\n# --- 分支结构 (${astResult.branches.length}) ---\n`;
            for (const b of astResult.branches.slice(0, 15)) {
                text += `# 行 ${b.lineno}: ${b.condition || b.type || '-'}\n`;
            }
        }
        if (astResult.loops && astResult.loops.length > 0) {
            text += `\n# --- 循环结构 (${astResult.loops.length}) ---\n`;
            for (const l of astResult.loops.slice(0, 15)) {
                text += `# 行 ${l.lineno}: ${l.type} 循环\n`;
            }
        }

        codeEl.innerHTML = highlightCode(text, lang);
    }

    // 更新代码块语言标记
    codeEl.className = lang === 'python' ? 'language-python' : 'language-cpp';
}

/**
 * 渲染 LLM 分析结果。
 */
function renderLLMResult(llmResult, lang) {
    const statusEl = document.getElementById('llmStatus');
    const codeEl = document.getElementById('llmCode');

    if (!llmResult || llmResult.error) {
        statusEl.textContent = llmResult?.error || '暂无数据';
        statusEl.style.color = '#dc2626';
        codeEl.innerHTML = '';
        return;
    }

    if (typeof llmResult === 'string') {
        statusEl.textContent = 'DeepSeek AI 注释生成完成';
        statusEl.style.color = '#16a34a';
        codeEl.innerHTML = highlightCode(llmResult, lang);
    } else {
        statusEl.textContent = '结果格式异常';
        statusEl.style.color = '#dc2626';
        codeEl.innerHTML = escapeHtml(JSON.stringify(llmResult, null, 2));
    }

    codeEl.className = lang === 'python' ? 'language-python' : 'language-cpp';
}

/**
 * 隐藏结果区（清空状态）。
 */
function clearResult() {
    document.getElementById('resultPlaceholder').style.display = 'flex';
    document.getElementById('resultContent').style.display = 'none';
}

// ── 通知 ─────────────────────────────────────────────────────────

/**
 * 显示 Toast 通知。
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity .3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── 文件下载 ─────────────────────────────────────────────────────

/**
 * 触发浏览器下载。
 * @param {Blob} blob
 * @param {string} filename
 */
function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
