import json
import io
import re

path = r"C:\Users\HomePC\.gemini\antigravity\brain\56a6f0ba-0ec2-454f-b692-5e202865a2af\.system_generated\logs\transcript_full.jsonl"
target_file_short = "frontend/src/components/driver/DriverProfileTab.jsx"

with io.open(path, "r", encoding="utf-8") as f:
    for line in f:
        if "run_command" in line and "DriverProfileTab.jsx" in line:
            try:
                data = json.loads(line)
                if data.get("step_index") == 1571:
                    for call in data.get("tool_calls", []):
                        if call.get("name") == "run_command":
                            args = call.get("args", {})
                            cmd = args.get("CommandLine", "")
                            match = re.search(r"\$script = @'([\s\S]+?)'@\nSet-Content", cmd)
                            if match:
                                py_script = match.group(1)
                                with io.open("temp_replay1571.py", "w", encoding="utf-8") as tf:
                                    tf.write(py_script)
                                print("Extracted step 1571 script.")
            except Exception as e:
                pass
