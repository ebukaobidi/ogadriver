import json
import io
import re

path = r"C:\Users\HomePC\.gemini\antigravity\brain\56a6f0ba-0ec2-454f-b692-5e202865a2af\.system_generated\logs\transcript_full.jsonl"
target_file = r"c:\xampp\htdocs\ogadriver.ng\frontend\src\components\driver\DriverProfileTab.jsx"
target_file_short = "frontend/src/components/driver/DriverProfileTab.jsx"

with io.open(path, "r", encoding="utf-8") as f:
    for line in f:
        if "DriverProfileTab.jsx" not in line:
            continue
        try:
            data = json.loads(line)
        except:
            continue
        
        for call in data.get("tool_calls", []):
            name = call.get("name")
            args = call.get("args", {})
            
            if name == "replace_file_content":
                if args.get("TargetFile", "").lower() == target_file.lower():
                    print("Replaying replace_file_content at step:", data.get("step_index"))
                    with io.open(target_file_short, "r", encoding="utf-8") as tf:
                        content = tf.read()
                    
                    target_content = args.get("TargetContent")
                    replacement = args.get("ReplacementContent")
                    # replace_file_content replaces the first occurrence or all if AllowMultiple is true
                    if args.get("AllowMultiple"):
                        content = content.replace(target_content, replacement)
                    else:
                        content = content.replace(target_content, replacement, 1)
                        
                    with io.open(target_file_short, "w", encoding="utf-8") as tf:
                        tf.write(content)
                        
            elif name == "write_to_file":
                if args.get("TargetFile", "").lower() == target_file.lower():
                    print("Replaying write_to_file at step:", data.get("step_index"))
                    with io.open(target_file_short, "w", encoding="utf-8") as tf:
                        tf.write(args.get("CodeContent"))
                        
            elif name == "run_command":
                cmd = args.get("CommandLine", "")
                if "DriverProfileTab.jsx" in cmd and "python" in cmd and "fix_" in cmd:
                    print("Found python script at step:", data.get("step_index"))
                    # The script contains inline python code. Let's just execute it.
                    # We can extract the script block.
                    match = re.search(r"\$script = @'([\s\S]+?)'@\nSet-Content", cmd)
                    if match:
                        py_script = match.group(1)
                        # execute the python script
                        print("Executing python patch...")
                        with io.open("temp_replay.py", "w", encoding="utf-8") as tf:
                            tf.write(py_script)
                        import subprocess
                        subprocess.run(["python", "temp_replay.py"])
                elif "DriverProfileTab.jsx" in cmd and "node" in cmd and "fix_" in cmd:
                    print("Found node script at step:", data.get("step_index"))
                    match = re.search(r"\$script = @'([\s\S]+?)'@\nSet-Content", cmd)
                    if match:
                        node_script = match.group(1)
                        print("Executing node patch...")
                        with io.open("temp_replay.cjs", "w", encoding="utf-8") as tf:
                            tf.write(node_script)
                        import subprocess
                        subprocess.run(["node", "temp_replay.cjs"])
