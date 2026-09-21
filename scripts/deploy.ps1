# Deploy script for mentora-web to AWS EC2
$ErrorActionPreference = "Stop"

$EC2_HOST = "43.205.26.79"
$EC2_USER = "ec2-user"
$KEY_PATH = "$HOME\Downloads\mentora-key-pair.pem"
$REMOTE_DIR = "/var/www/mentora-web/dist"

Write-Host "[1/3] Building application for production..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Aborting deployment." -ForegroundColor Red
    exit 1
}

Write-Host "[2/3] Uploading dist files to EC2 ($EC2_HOST)..." -ForegroundColor Cyan
scp -o BatchMode=yes -o StrictHostKeyChecking=no -i "$KEY_PATH" -r dist/* "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[3/3] Setting remote permissions..." -ForegroundColor Cyan
ssh -n -o BatchMode=yes -o StrictHostKeyChecking=no -i "$KEY_PATH" "${EC2_USER}@${EC2_HOST}" "sudo chmod -R 755 /var/www"

Write-Host "`nDeployed successfully to http://$EC2_HOST/" -ForegroundColor Green
