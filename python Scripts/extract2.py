import json
import io

path = r"C:\Users\HomePC\.gemini\antigravity\brain\56a6f0ba-0ec2-454f-b692-5e202865a2af\.system_generated\logs\transcript_full.jsonl"
with io.open(path, "r", encoding="utf-8") as f:
    for line in f:
        if "DriverProfileTab.jsx" in line and "tool_calls" in line:
            data = json.loads(line)
            for call in data.get("tool_calls", []):
                name = call.get("name")
                if name in ["write_to_file", "replace_file_content", "run_command"]:
                    args = call.get("args", {})
                    # For run_command, we look inside CommandLine
                    if name == "run_command":
                        cmd = args.get("CommandLine", "")
                        if "DriverProfileTab.jsx" in cmd and "python" in cmd:
                            print(f"Found run_command at step: {data.get('step_index')}")
                    else:
                        target = args.get("TargetFile", "")
                        if "DriverProfileTab.jsx" in target:
                            print(f"Found {name} at step: {data.get('step_index')}")
