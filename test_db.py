import asyncio
from backend.database import engine
from sqlalchemy import text

async def test_conn():
    print(f"Testing DB connection using settings: {engine.url}")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Success! Result: {result.scalar()}")
    except Exception as e:
        print(f"Failed: {type(e)} - {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_conn())
