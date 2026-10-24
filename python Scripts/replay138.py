import json
import io

path = r"C:\Users\HomePC\.gemini\antigravity\brain\56a6f0ba-0ec2-454f-b692-5e202865a2af\.system_generated\logs\transcript_full.jsonl"
target_file_short = "frontend/src/components/driver/DriverProfileTab.jsx"

with io.open(path, "r", encoding="utf-8") as f:
    for line in f:
        if "replace_file_content" in line and "DriverProfileTab.jsx" in line:
            try:
                data = json.loads(line)
                if data.get("step_index") == 138:
                    for call in data.get("tool_calls", []):
                        if call.get("name") == "replace_file_content":
                            args = call.get("args", {})
                            target = args.get("TargetContent")
                            replacement = args.get("ReplacementContent")
                            
                            with io.open(target_file_short, "r", encoding="utf-8") as tf:
                                content = tf.read()
                            
                            content = content.replace(target, replacement, 1)
                            
                            with io.open(target_file_short, "w", encoding="utf-8") as tf:
                                tf.write(content)
                            print("Replayed step 138!")
            except Exception as e:
                pass
