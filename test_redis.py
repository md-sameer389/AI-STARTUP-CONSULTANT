import redis

for host in ['127.0.0.1', '172.25.9.89']:
    try:
        r = redis.Redis(host=host, port=6379, db=0, socket_timeout=5, socket_connect_timeout=5)
        result = r.ping()
        print(f'{host}: PING={result}')
        r.set('test_key', 'hello', ex=10)
        val = r.get('test_key')
        print(f'{host}: GET={val}')
        r.close()
    except Exception as e:
        print(f'{host}: FAIL - {type(e).__name__}: {str(e)[:80]}')

print('done')
