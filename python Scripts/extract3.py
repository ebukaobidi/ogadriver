import json
import io

path = r"C:\Users\HomePC\.gemini\antigravity\brain\56a6f0ba-0ec2-454f-b692-5e202865a2af\.system_generated\logs\transcript_full.jsonl"
with io.open(path, "r", encoding="utf-8") as f:
    for line in f:
        if "replace_file_content" in line and "DriverProfileTab.jsx" in line:
            data = json.loads(line)
            if data.get("step_index") == 138:
                for call in data.get("tool_calls", []):
                    if call.get("name") == "replace_file_content":
                        args = call.get("args", {})
                        with io.open("step138_replacement.txt", "w", encoding="utf-8") as out:
                            out.write(args.get("ReplacementContent", ""))
                        print("Wrote replacement to step138_replacement.txt")
