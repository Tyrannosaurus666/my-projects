import re

# 邮箱正则
EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

def validate_email(email):
    """验证邮箱格式"""
    if re.match(EMAIL_PATTERN, email):
        return True
    return False

def extract_emails(text):
    return re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)

def extract_phone_numbers(text):
    return re.findall(r'1[3-9]\d{9}', text)

def clean_text(text):
    # 去除多余空格
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()

emails = ["test@example.com", "invalid-email", "user@domain.co", "@no-user.com"]
for e in emails:
    print(f"{e}: {validate_email(e)}")

sample = "Contact: alice@mail.com or bob@test.org. Phone: 13800138000"
print(extract_emails(sample))
print(extract_phone_numbers(sample))
