"""
DeepSeek API 封装 —— 调用大模型生成代码注释。

使用 OpenAI 兼容 SDK 接入 DeepSeek API。
"""

import re
import logging
from openai import OpenAI

from config import (
    DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL,
    LLM_TEMPERATURE,
    LLM_MAX_TOKENS,
    LLM_TIMEOUT_SECONDS,
    LLM_MAX_RETRIES,
)
from llm.prompt import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)

# 初始化客户端（全局复用）
_client: OpenAI | None = None


def _get_client() -> OpenAI:
    """获取或初始化 DeepSeek API 客户端。

    Returns:
        OpenAI 客户端实例
    """
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=DEEPSEEK_API_KEY,
            base_url=DEEPSEEK_BASE_URL,
            timeout=LLM_TIMEOUT_SECONDS,
        )
    return _client


def _extract_code_from_markdown(response_text: str, language: str = "") -> str:
    """从 LLM 返回中提取代码块（去除 markdown 代码块标记）。

    DeepSeek 可能返回带 ``` 标记的代码块，需要提取纯代码。

    Args:
        response_text: LLM 原始响应
        language: 代码语言（可选，用于匹配代码块标记）

    Returns:
        提取的纯代码字符串
    """
    # 尝试匹配带语言标记的代码块
    pattern = r'```(?:' + (re.escape(language) if language else r'\w*') + r')?\s*\n(.*?)```'
    matches = re.findall(pattern, response_text, re.DOTALL)

    if matches:
        # 取最长的一块（通常就是完整代码）
        return max(matches, key=len).strip()

    # 尝试匹配不带语言标记的代码块
    pattern = r'```\s*\n(.*?)```'
    matches = re.findall(pattern, response_text, re.DOTALL)
    if matches:
        return max(matches, key=len).strip()

    # 没有代码块标记，直接返回原文
    return response_text.strip()


def generate_comments(
    code: str,
    language: str,
    ast_hints: dict | None = None,
) -> str:
    """调用 DeepSeek API 为代码生成注释。

    Args:
        code: 原始源代码字符串
        language: "python" 或 "cpp"
        ast_hints: AST 分析结果（可选），作为 LLM 的辅助上下文

    Returns:
        带注释的完整代码字符串

    Raises:
        RuntimeError: API 调用失败（含重试后仍未成功）
    """
    client = _get_client()
    user_prompt = build_user_prompt(code, language, ast_hints)

    last_error: Exception | None = None

    for attempt in range(LLM_MAX_RETRIES + 1):
        try:
            logger.info(
                "调用 DeepSeek API (尝试 %d/%d): model=%s, language=%s, code_len=%d",
                attempt + 1, LLM_MAX_RETRIES + 1, DEEPSEEK_MODEL, language, len(code),
            )

            response = client.chat.completions.create(
                model=DEEPSEEK_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=LLM_TEMPERATURE,
                max_tokens=LLM_MAX_TOKENS,
            )

            raw_text = response.choices[0].message.content or ""

            # 提取代码（去除 markdown 代码块标记）
            annotated_code = _extract_code_from_markdown(raw_text, language)

            logger.info(
                "DeepSeek API 调用成功: tokens_used=%s",
                response.usage,
            )
            return annotated_code

        except Exception as e:
            last_error = e
            logger.warning("DeepSeek API 调用失败 (尝试 %d/%d): %s", attempt + 1, LLM_MAX_RETRIES + 1, e)

    # 所有重试均失败
    raise RuntimeError(
        f"DeepSeek API 调用失败（已重试 {LLM_MAX_RETRIES} 次）: {last_error}"
    )
