import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const SESSIONS_DIR = process.argv[2] || `${process.env.USERPROFILE}/.claude/projects/D--code-2501060334-30`;
const OUT_DIR = process.argv[3] || 'docs/对话记录';

function formatTime(ts) {
  if (!ts) return '未知时间';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max) + '...' : s;
}

function processFile(filepath) {
  const raw = readFileSync(filepath, 'utf-8');
  const lines = raw.trim().split('\n');
  const messages = [];
  let sessionDate = '';

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (!sessionDate && entry.timestamp) {
        sessionDate = formatTime(entry.timestamp);
      }

      if (entry.type === 'user' && entry.message?.role === 'user') {
        const content = typeof entry.message.content === 'string'
          ? entry.message.content
          : JSON.stringify(entry.message.content);
        messages.push({ role: '👤 用户', content, time: formatTime(entry.timestamp) });
      } else if (entry.type === 'assistant' && entry.message?.role === 'assistant') {
        const content = entry.message.content;
        if (Array.isArray(content)) {
          const texts = content
            .filter(c => c.type === 'text' && c.text?.trim())
            .map(c => c.text);
          const toolCalls = content.filter(c => c.type === 'tool_use').length;
          const text = texts.join('\n\n');
          if (text) {
            messages.push({ role: '🤖 Claude', content: text + (toolCalls > 0 ? `\n\n*[执行了 ${toolCalls} 次工具调用]*` : ''), time: formatTime(entry.timestamp) });
          }
        } else if (typeof content === 'string' && content.trim()) {
          messages.push({ role: '🤖 Claude', content, time: formatTime(entry.timestamp) });
        }
      }
    } catch (e) {
      // skip malformed lines
    }
  }

  return { messages, sessionDate };
}

function buildMarkdown(sessionId, { messages, sessionDate }) {
  if (messages.length === 0) return null;

  // Find first user message as title
  const firstUser = messages.find(m => m.role === '👤 用户');
  const title = firstUser
    ? truncate(firstUser.content.replace(/\n/g, ' '), 80)
    : '会话记录';

  let md = `# ${title}\n\n`;
  md += `> **会话 ID**: ${sessionId}\n`;
  md += `> **日期**: ${sessionDate}\n`;
  md += `> **消息数**: ${messages.length}\n\n`;
  md += `---\n\n`;

  for (const msg of messages) {
    md += `### ${msg.role}\n\n`;
    md += `${msg.content}\n\n`;
  }

  return md;
}

// Main
const files = readdirSync(SESSIONS_DIR)
  .filter(f => f.endsWith('.jsonl') && !f.includes('subagent'))
  .sort();

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

console.log(`找到 ${files.length} 个会话文件\n`);

for (const f of files) {
  const filepath = join(SESSIONS_DIR, f);
  const sessionId = basename(f, '.jsonl');
  console.log(`处理: ${f} ...`);
  const data = processFile(filepath);
  const md = buildMarkdown(sessionId, data);

  if (md) {
    const dateStr = data.sessionDate.replace(/[ :]/g, '-').slice(0, 16);
    const outName = `${dateStr}_${sessionId.slice(0, 8)}.md`;
    const outPath = join(OUT_DIR, outName);
    writeFileSync(outPath, md, 'utf-8');
    console.log(`  → ${outName} (${md.length} 字符)`);
  } else {
    console.log(`  → 跳过（无有效消息）`);
  }
}

console.log(`\n完成！输出目录: ${OUT_DIR}`);
