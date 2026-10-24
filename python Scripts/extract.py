import json
import io

path = r"C:\Users\HomePC\.gemini\antigravity\brain\56a6f0ba-0ec2-454f-b692-5e202865a2af\.system_generated\logs\transcript_full.jsonl"
with io.open(path, "r", encoding="utf-8") as f:
    for line in f:
        if "DriverProfileTab.jsx" in line and "replace_file_content" in line and "tool_calls" in line:
            data = json.loads(line)
            for call in data.get("tool_calls", []):
                if call.get("name") == "replace_file_content":
                    args = call.get("args", {})
                    if "DriverProfileTab.jsx" in args.get("TargetFile", ""):
                        print("Found replace_file_content for DriverProfileTab.jsx at step:", data.get("step_index"))
