import os
import zipfile

zip_path = 'c:\\xampp\\htdocs\\ogadriver.ng\\pwa_update.zip'
dist_dir = 'c:\\xampp\\htdocs\\ogadriver.ng\\backend\\frontend\\dist'

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # 1. Add all dist files directly under public/
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, dist_dir)
            arcname = os.path.join('public', rel_path).replace('\\', '/')
            zipf.write(full_path, arcname)

    # 2. Add backend updated files
    backend_files = [
        'app/Services/NotificationService.php',
        'app/Models/User.php',
        'app/Notifications/SystemAlertNotification.php',
        'resources/views/delete_account.blade.php',
        'restore_database.php',
        'ogadriver_restore.sql',
    ]
    for bf in backend_files:
        full_bf = os.path.join('c:\\xampp\\htdocs\\ogadriver.ng', bf)
        if os.path.exists(full_bf):
            zipf.write(full_bf, bf)

size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f'pwa_update.zip created successfully! Size: {size_mb:.2f} MB')
