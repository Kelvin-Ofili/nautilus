# Removes deprecated apps/portal (unlocks stubborn .node files when possible).
#
# From repo root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\remove-legacy-apps-portal.ps1 -KillNode
#
# If "Access is denied" persists, either:
#   A) Close Cursor/VS Code completely, reboot, then run this script again before opening the repo, or
#   B) Run PowerShell as Administrator with -TakeOwnership (rewrites ACLs on apps\portal):
#   powershell -ExecutionPolicy Bypass -File .\scripts\remove-legacy-apps-portal.ps1 -KillNode -TakeOwnership

param(
    [switch] $KillNode,
    [switch] $TakeOwnership
)

$ErrorActionPreference = "Continue"
$repoRoot = Split-Path $PSScriptRoot -Parent
$portal = Join-Path $repoRoot "apps\portal"

if (-not (Test-Path $portal)) {
    Write-Host "Nothing to do: $portal does not exist."
    exit 0
}

if ($KillNode) {
    Write-Host "Stopping all processes named 'node'..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Stopping PID $($_.Id)"
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

if ($TakeOwnership) {
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Host "ERROR: -TakeOwnership requires PowerShell Run as administrator."
        exit 1
    }
    Write-Host "Taking ownership and granting full control (recursive)..."
    & takeown.exe /R /F $portal /D Y 2>&1 | Out-Host
    $user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    & icacls.exe $portal /grant "${user}:(OI)(CI)F" /T 2>&1 | Out-Host
    Start-Sleep -Seconds 1
}

Write-Host "Removing $portal ..."
cmd /c "rd /s /q `"$portal`""

if (Test-Path $portal) {
    Write-Host ""
    Write-Host "Still blocked. Typical causes:"
    Write-Host "  - Cursor/VS Code still indexing the folder (fully quit the app, or reboot)."
    Write-Host "  - Antivirus real-time scan (temporarily exclude apps\portal or the .node file)."
    Write-Host "  - Retry with an elevated shell: -KillNode -TakeOwnership"
    exit 1
}

Write-Host "Removed apps\portal"

$apps = Join-Path $repoRoot "apps"
if ((Test-Path $apps) -and -not (Get-ChildItem $apps -Force -ErrorAction SilentlyContinue | Select-Object -First 1)) {
    Remove-Item -LiteralPath $apps -Force -ErrorAction SilentlyContinue
    Write-Host "Removed empty apps\"
}

exit 0
