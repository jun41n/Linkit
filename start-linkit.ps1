$ErrorActionPreference = "Stop"

$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 8031
$Url = "http://localhost:$Port/"
$OutLog = Join-Path $AppDir "expo-8031-current.log"
$ErrLog = Join-Path $AppDir "expo-8031-error-current.log"

function Test-LinkItPort {
    param([int]$PortNumber)

    $connection = Test-NetConnection -ComputerName "localhost" -Port $PortNumber -WarningAction SilentlyContinue
    return [bool]$connection.TcpTestSucceeded
}

Write-Host "진짜 링킷 주소: $Url"

if (-not (Test-LinkItPort -PortNumber $Port)) {
    Write-Host "앱을 켭니다..."
    $pnpm = Get-Command "pnpm.cmd" -ErrorAction Stop
    Start-Process `
        -FilePath $pnpm.Source `
        -ArgumentList @("exec", "expo", "start", "--localhost", "--port", "$Port") `
        -WorkingDirectory $AppDir `
        -RedirectStandardOutput $OutLog `
        -RedirectStandardError $ErrLog `
        -WindowStyle Hidden

    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        if (Test-LinkItPort -PortNumber $Port) {
            $ready = $true
            break
        }
    }

    if (-not $ready) {
        throw "진짜 링킷이 아직 열리지 않았습니다. 로그를 확인하세요: $ErrLog"
    }
}

Start-Process $Url
Write-Host "열었습니다: $Url"
