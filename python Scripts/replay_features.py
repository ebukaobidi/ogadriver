import json
import io
import re

path = r"C:\Users\HomePC\.gemini\antigravity\brain\56a6f0ba-0ec2-454f-b692-5e202865a2af\.system_generated\logs\transcript_full.jsonl"
target_file_short = "frontend/src/components/driver/DriverProfileTab.jsx"

found = False
with io.open(path, "r", encoding="utf-8") as f:
    for line in f:
        if "fix_profile_features.py" in line:
            try:
                data = json.loads(line)
                for call in data.get("tool_calls", []):
                    if call.get("name") == "run_command":
                        cmd = call.get("args", {}).get("CommandLine", "")
                        if "fix_profile_features.py" in cmd:
                            match = re.search(r"\$script = @'([\s\S]+?)'@\nSet-Content", cmd)
                            if match:
                                py_script = match.group(1)
                                with io.open("temp_replay_features.py", "w", encoding="utf-8") as tf:
                                    tf.write(py_script)
                                print("Extracted features script at step", data.get("step_index"))
                                found = True
                                break
                if found:
                    break
            except Exception as e:
                pass
