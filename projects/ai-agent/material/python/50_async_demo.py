import asyncio

async def fetch_data(delay, data):
    await asyncio.sleep(delay)
    return f"Data: {data}"

async def process_item(item):
    result = await fetch_data(0.1, item)
    return result.upper()

async def main():
    tasks = [process_item(i) for i in range(5)]
    results = await asyncio.gather(*tasks)
    for r in results:
        print(r)

async def producer(queue):
    for i in range(5):
        await queue.put(i)
        await asyncio.sleep(0.1)
    await queue.put(None)

async def consumer(queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        print(f"Consumed: {item}")

async def run_pipeline():
    queue = asyncio.Queue()
    await asyncio.gather(producer(queue), consumer(queue))

async def async_generator():
    for i in range(3):
        await asyncio.sleep(0.1)
        yield i

async def use_generator():
    result = []
    async for val in async_generator():
        result.append(val)
    print(result)

asyncio.run(main())
asyncio.run(run_pipeline())
asyncio.run(use_generator())
