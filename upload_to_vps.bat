@echo off
title Upload OgaDriver to VPS
color 0A
cls
echo ======================================================================
echo             OGADRIVER - VPS AUTOMATIC UPLOADER
echo ======================================================================
echo.
echo Target Server: 169.58.115.46
echo Source File:   C:\xampp\htdocs\ogadriver.ng\ogadriver_deploy.zip
echo Destination:   /var/www/ogadriver_deploy.zip
echo.
echo ======================================================================
echo [INFO] When prompted below, type your VPS root password and press Enter.
echo        (Note: the password letters will be hidden as you type)
echo ======================================================================
echo.

cd /d C:\xampp\htdocs\ogadriver.ng
scp .\ogadriver_deploy.zip root@169.58.115.46:/var/www/

echo.
if %errorlevel% equ 0 (
    color 02
    echo ======================================================================
    echo [SUCCESS] Upload completed successfully!
    echo The file ogadriver_deploy.zip is now inside /var/www/ on your VPS.
    echo ======================================================================
) else (
    color 0C
    echo ======================================================================
    echo [ERROR] Upload was not completed.
    echo Please verify your root password and try again.
    echo ======================================================================
)
echo.
pause
