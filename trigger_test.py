import urllib.request
import urllib.parse
import json
import time

def trigger_analysis():
    url = "http://localhost:8000/api/v1/analyze"
    data = {
        "startup_idea": "AI-powered personalized travel planner app for budget travelers",
        "user_id": None
    }
    req_body = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=req_body,
        headers={"Content-Type": "application/json"}
    )
    
    print("Sending POST request to trigger analysis...")
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            print("Response:", res_data)
            return res_data.get("job_id")
    except Exception as e:
        print("Error triggering analysis:", e)
        return None

def poll_status(job_id):
    if not job_id:
        return
    
    url = f"http://localhost:8000/api/v1/status/{job_id}"
    print(f"Polling status for job {job_id}...")
    
    while True:
        try:
            with urllib.request.urlopen(url) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                status = res_data.get("status")
                agent = res_data.get("current_agent")
                progress = res_data.get("progress_percent")
                print(f"[{time.strftime('%H:%M:%S')}] Status: {status} | Agent: {agent} | Progress: {progress}%")
                
                if status in ["completed", "failed"]:
                    break
        except Exception as e:
            print("Error polling status:", e)
        
        time.sleep(5)

if __name__ == "__main__":
    job_id = trigger_analysis()
    poll_status(job_id)
