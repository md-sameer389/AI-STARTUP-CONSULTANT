"""
Full 7-agent pipeline test: "AI fitness app for college students"
Submits analysis, polls for completion, and prints the full report.
"""
import requests
import time
import json

BASE = "http://127.0.0.1:8000/api/v1"
IDEA = "AI fitness app for college students"

print("=" * 60)
print("PIPELINE TEST: 7-Agent Analysis")
print(f"Idea: {IDEA}")
print("=" * 60)

# Step 1: Login
print("\n[1] Logging in...")
lr = requests.post(f"{BASE}/auth/login", json={"email": "test@startup.ai", "password": "TestPass123!"}, timeout=15)
if lr.status_code != 200:
    # Register first
    requests.post(f"{BASE}/auth/register", json={"email": "test@startup.ai", "password": "TestPass123!", "name": "Test"}, timeout=15)
    lr = requests.post(f"{BASE}/auth/login", json={"email": "test@startup.ai", "password": "TestPass123!"}, timeout=15)

data = lr.json()
token = data.get("token") or data.get("access_token")
user_id = data.get("user_id")
print(f"    User: {user_id}")
print(f"    Token: {str(token)[:40]}...")

headers = {"Authorization": f"Bearer {token}"}

# Step 2: Submit analysis
print(f"\n[2] Submitting analysis job...")
ar = requests.post(f"{BASE}/analyze",
    json={"startup_idea": IDEA, "user_id": user_id},
    headers=headers, timeout=30)

if ar.status_code != 202:
    print(f"    FAILED: {ar.status_code} - {ar.text[:200]}")
    exit(1)

job_id = ar.json()["job_id"]
print(f"    Job ID: {job_id}")
print(f"    Status: {ar.json().get('status', '?')}")

# Step 3: Poll for completion
print(f"\n[3] Polling for completion (up to 10 minutes)...")
start = time.time()
last_status = None
while time.time() - start < 600:
    sr = requests.get(f"{BASE}/status/{job_id}", headers=headers, timeout=15)
    if sr.status_code != 200:
        print(f"    Status check failed: {sr.status_code}")
        time.sleep(10)
        continue

    status_data = sr.json()
    current_status = status_data.get("status", "unknown")
    elapsed = int(time.time() - start)

    if current_status != last_status:
        print(f"    [{elapsed}s] Status: {current_status}")
        last_status = current_status

    if current_status == "completed":
        print(f"\n    COMPLETED in {elapsed} seconds!")
        break
    elif current_status == "failed":
        err = status_data.get("error", "No error message")
        print(f"\n    FAILED: {err}")
        exit(1)
    
    time.sleep(15)
else:
    print("\n    TIMEOUT: Job did not complete within 10 minutes")
    exit(1)

# Step 4: Get the report
print(f"\n[4] Fetching report...")
rr = requests.get(f"{BASE}/report/{job_id}", headers=headers, timeout=30)
if rr.status_code != 200:
    print(f"    FAILED: {rr.status_code} - {rr.text[:200]}")
    exit(1)

report = rr.json()
print("\n" + "=" * 60)
print("REPORT SUMMARY")
print("=" * 60)
print(f"Job ID: {report.get('job_id')}")
print(f"Idea:   {report.get('startup_idea')}")
print(f"PDF:    {report.get('pdf_url') or 'Not generated'}")

sections = ["market_research", "competitor_analysis", "business_strategy", "financials", "swot", "pitch_deck"]
for sec in sections:
    val = report.get(sec)
    if val:
        snippet = str(val)[:120].replace("\n", " ")
        print(f"\n[{sec.upper()}]")
        print(f"  {snippet}...")
    else:
        print(f"\n[{sec.upper()}] -- Not present --")

print("\n" + "=" * 60)
print("PIPELINE TEST: COMPLETE")
print("=" * 60)
