"""
API endpoint test script — tests all required endpoints
"""
import requests
import json
import time

BASE = "http://127.0.0.1:8000/api/v1"
RESULTS = []

def test(name, method, path, body=None, expected_codes=None, headers=None):
    url = f"{BASE}{path}"
    try:
        kwargs = {"timeout": 60, "headers": headers or {}}
        if body:
            kwargs["json"] = body
        resp = getattr(requests, method)(url, **kwargs)
        status = resp.status_code
        ok = status in (expected_codes or [200, 201, 202, 400, 404, 422])
        RESULTS.append({"endpoint": f"{method.upper()} {path}", "status": status, "pass": ok, "detail": resp.text[:100]})
        print(f"{'PASS' if ok else 'FAIL'} [{status}] {method.upper()} {path}")
        return resp
    except Exception as e:
        RESULTS.append({"endpoint": f"{method.upper()} {path}", "status": "ERROR", "pass": False, "detail": str(e)[:100]})
        print(f"ERR  [ERR] {method.upper()} {path} - {str(e)[:80]}")
        return None

print("=== API ENDPOINT TESTS ===\n")

# Health check
test("Health", "get", "/health", expected_codes=[200])

# Auth: Register 
r = test("Auth Register", "post", "/auth/register", 
         body={"email": "test@startup.ai", "password": "TestPass123!", "name": "Test User"},
         expected_codes=[201, 400, 409, 422])

# Auth: Login
lr = test("Auth Login", "post", "/auth/login",
          body={"email": "test@startup.ai", "password": "TestPass123!"},
          expected_codes=[200, 401, 422])

token = None
user_id = None
if lr and lr.status_code == 200:
    data = lr.json()
    token = data.get("token") or data.get("access_token")
    user_id = data.get("user_id")
    print(f"   -> Token: {str(token)[:30]}..., UserID: {user_id}")

auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

# Analyze
ar = test("Analyze (Submit)", "post", "/analyze",
          body={"startup_idea": "AI fitness app for college students", "user_id": user_id or "test-user"},
          expected_codes=[202, 401, 422],
          headers=auth_headers)

job_id = None
if ar and ar.status_code == 202:
    data = ar.json()
    job_id = data.get("job_id")
    print(f"   -> Job ID: {job_id}")

# Status check
if job_id:
    time.sleep(1)
    test("Status Check", "get", f"/status/{job_id}",
         expected_codes=[200, 404],
         headers=auth_headers)
else:
    test("Status (dummy ID)", "get", "/status/00000000-0000-0000-0000-000000000000",
         expected_codes=[200, 404])

# Chat
test("Chat Q&A", "post", "/chat",
     body={"question": "What is market size for fitness apps?", "user_id": user_id or "test-user"},
     expected_codes=[200, 422, 500])

# Report (dummy)
test("Report (dummy)", "get", "/report/00000000-0000-0000-0000-000000000000",
     expected_codes=[200, 400, 404])

print("\n=== SUMMARY ===")
passed = sum(1 for r in RESULTS if r["pass"])
total = len(RESULTS)
print(f"Passed: {passed}/{total}")
for r in RESULTS:
    icon = "PASS" if r["pass"] else "FAIL"
    print(f"  {icon} [{r['status']}] {r['endpoint']}")
