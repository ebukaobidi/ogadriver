import os
import zipfile

zip_path = r'c:\xampp\htdocs\ogadriver.ng\ogadriver_deploy.zip'
if os.path.exists(zip_path):
    os.remove(zip_path)

exclude_dirs = {
    'vendor', 'node_modules', '.git', 'temp_export', 'scratch',
    'cache', 'sessions', 'views', 'logs', '.idea', '.vscode'
}

root_dir = r'c:\xampp\htdocs\ogadriver.ng'

print("Creating production deployment zip...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(root_dir):
        # Exclude unwanted directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith('.zip') or file.endswith('.gz') or file.endswith('.tar'):
                continue
            if 'storage\\framework' in root or 'storage/framework' in root:
                continue
            if 'storage\\logs' in root or 'storage/logs' in root:
                continue
                
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, root_dir)
            zipf.write(full_path, arcname)

size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"Archive created successfully: {zip_path} ({size_mb:.2f} MB)")
