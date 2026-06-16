"""
工具函数：语言检测、文件处理、ID 生成、注册表持久化。
"""
import json
import os
import uuid
from pathlib import Path

from config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE, UPLOAD_DIR

# 注册表持久化路径
REGISTRY_FILE = os.path.join(UPLOAD_DIR, "registry.json")


def detect_language(filename: str) -> str:
    """根据文件后缀检测语言类型。

    Args:
        filename: 文件名

    Returns:
        "python" | "cpp"
    """
    suffix = Path(filename).suffix.lower()
    mapping = {
        ".py": "python",
        ".cpp": "cpp",
        ".cc": "cpp",
        ".cxx": "cpp",
        ".hpp": "cpp",
    }
    return mapping.get(suffix, "unknown")


def language_to_suffix(language: str) -> str:
    """将语言标识映射为统一的文件扩展名。

    统一规则：
        python → .py
        cpp    → .cpp（无论原始扩展名是 .cc / .cxx / .hpp）

    这确保了保存路径和读取路径永远一致。
    """
    return ".py" if language == "python" else ".cpp"


def generate_file_id() -> str:
    """生成唯一文件 ID。"""
    return uuid.uuid4().hex[:12]


def validate_file(filename: str, file_size: int) -> tuple[bool, str]:
    """验证上传文件是否合法。

    Returns:
        (is_valid, error_message)
    """
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        return False, f"不支持的文件类型 '{suffix}'，仅支持 .py 和 .cpp 文件"

    if file_size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE / (1024 * 1024)
        return False, f"文件大小超过限制 ({max_mb:.0f}MB)"

    if file_size == 0:
        return False, "文件为空"

    return True, ""


def save_upload_file(file_id: str, language: str, content: bytes) -> str:
    """保存上传文件到 uploads 目录，使用统一后缀。

    根据检测到的语言（而非原始扩展名）确定后缀，确保：
    - .cc / .cxx / .hpp 文件统一保存为 {file_id}.cpp
    - 保存路径与分析读取路径保持一致

    Returns:
        实际保存的文件路径
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    suffix = language_to_suffix(language)
    save_name = f"{file_id}{suffix}"
    save_path = os.path.join(UPLOAD_DIR, save_name)

    with open(save_path, "wb") as f:
        f.write(content)

    return save_path


def get_upload_file_path(file_id: str, language: str) -> str:
    """获取上传文件在磁盘上的完整路径。

    根据语言返回统一后缀对应的文件路径，与 save_upload_file 保持一致。
    """
    suffix = language_to_suffix(language)
    return os.path.join(UPLOAD_DIR, f"{file_id}{suffix}")


def read_upload_file(file_id: str, language: str) -> str | None:
    """读取上传文件的文本内容。

    Args:
        file_id: 文件 ID
        language: "python" | "cpp"

    Returns:
        文件内容字符串，文件不存在则返回 None
    """
    file_path = get_upload_file_path(file_id, language)

    if not os.path.exists(file_path):
        return None

    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def load_registry() -> dict[str, dict]:
    """从磁盘加载文件注册表，服务重启后恢复状态。

    对于注册表中引用但磁盘上已不存在的文件，自动清理对应条目。
    """
    if not os.path.exists(REGISTRY_FILE):
        return {}

    try:
        with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
            registry = json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}

    valid_registry = {}
    for file_id, info in registry.items():
        language = info.get("language", "python")
        file_path = get_upload_file_path(file_id, language)
        if os.path.exists(file_path):
            # 重置状态为 uploaded（分析结果不持久化，需重新分析）
            info["status"] = "uploaded"
            valid_registry[file_id] = info

    return valid_registry


def save_registry(registry: dict[str, dict]) -> None:
    """将文件注册表写入磁盘。"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
        json.dump(registry, f, ensure_ascii=False, indent=2)


def cleanup_file_on_disk(file_id: str, language: str) -> None:
    """删除磁盘上的文件（使用统一后缀）。"""
    file_path = get_upload_file_path(file_id, language)
    if os.path.exists(file_path):
        os.remove(file_path)
    # 清理可能存在的旧版遗留文件（历史兼容）
    alt_suffixes = [".cc", ".cxx", ".hpp"] if language == "cpp" else []
    for alt in alt_suffixes:
        alt_path = os.path.join(UPLOAD_DIR, f"{file_id}{alt}")
        if os.path.exists(alt_path):
            os.remove(alt_path)
