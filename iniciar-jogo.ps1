$ErrorActionPreference = 'Stop'
$gameDirectory = $PSScriptRoot
$gameUrl = 'http://127.0.0.1:8080/'
$isRunning = $false
try {
    $response = Invoke-WebRequest -Uri $gameUrl -UseBasicParsing -TimeoutSec 2
    $isRunning = $response.StatusCode -eq 200
} catch {}
if (-not $isRunning) {
    Start-Process -FilePath 'python' -ArgumentList @('-u', '-m', 'http.server', '8080', '--bind', '127.0.0.1') -WorkingDirectory $gameDirectory -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 15; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $gameUrl -UseBasicParsing -TimeoutSec 1
            if ($response.StatusCode -eq 200) { $isRunning = $true; break }
        } catch {}
        Start-Sleep -Milliseconds 200
    }
}
if (-not $isRunning) { throw 'Não foi possível iniciar o servidor. Verifique se Python está instalado e se a porta 8080 está disponível.' }
Start-Process $gameUrl
