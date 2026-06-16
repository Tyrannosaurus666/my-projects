"""
配置文件 —— 集中管理所有可配置项。
"""
import os

# 从 .env 文件加载环境变量（如果存在）
_env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.isfile(_env_path):
    with open(_env_path, encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                os.environ.setdefault(_k.strip(), _v.strip())

# DeepSeek API 配置
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "your-deepseek-api-key")
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"

# 目录配置（相对于 backend/）
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
RESULT_DIR = os.path.join(os.path.dirname(__file__), "results")

# 文件大小限制 (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

# 支持的文件扩展名（需与 detect_language 和前端 handleFiles 过滤逻辑保持一致）
ALLOWED_EXTENSIONS = {".py", ".cpp", ".cc", ".cxx", ".hpp"}

# LLM 配置
LLM_TEMPERATURE = 0.2
LLM_MAX_TOKENS = 4096
LLM_TIMEOUT_SECONDS = 30
LLM_MAX_RETRIES = 1
