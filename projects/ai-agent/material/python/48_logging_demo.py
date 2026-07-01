import logging

logger = logging.getLogger("MyApp")
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.WARNING)

file_handler = logging.FileHandler("app.log")
file_handler.setLevel(logging.DEBUG)

formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(file_handler)

def divide(a, b):
    logger.debug(f"divide called with a={a}, b={b}")
    if b == 0:
        logger.error("Division by zero attempted!")
        return None
    result = a / b
    logger.info(f"Result: {result}")
    return result

def process_data(data):
    logger.info(f"Processing {len(data)} items")
    for i, item in enumerate(data):
        try:
            processed = item * 2
            logger.debug(f"Item {i}: {item} -> {processed}")
        except Exception as e:
            logger.warning(f"Failed to process item {i}: {e}")

divide(10, 2)
divide(10, 0)
process_data([1, 2, 'x', 4])
