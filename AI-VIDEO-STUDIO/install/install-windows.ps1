<#
.SYNOPSIS
  AI-VIDEO-STUDIO installer for Windows 10/11 (free & open-source tools only).

.DESCRIPTION
  Inspects the PC, installs only what is missing (winget, official sources), creates the studio
  in %USERPROFILE%\AI-VIDEO-STUDIO without overwriting existing files, builds isolated Python
  environments, installs Arabic fonts per-user (no admin), then runs the automatic test suite.

  Large downloads and steps that can trigger an administrator (UAC) prompt are confirmed first
  unless -Yes is given.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File install\install-windows.ps1
  powershell -ExecutionPolicy Bypass -File install\install-windows.ps1 -All
#>
[CmdletBinding()]
param(
  [string]$StudioDir = (Join-Path $env:USERPROFILE 'AI-VIDEO-STUDIO'),
  [switch]$All,          # everything below
  [switch]$WhisperX,     # WhisperX in its own venv (needs PyTorch, ~2-4 GB)
  [switch]$ComfyUI,      # ComfyUI in its own venv (needs PyTorch, ~3-5 GB, models separate)
  [switch]$OpenMontage,  # clone OpenMontage (AGPL-3.0 agentic video framework)
  [switch]$Models,       # pre-download Whisper model sized for your GPU + optional ComfyUI model
  [switch]$Yes,          # do not ask for confirmations
  [switch]$SkipTests
)
# 'Continue': PowerShell 5.1 would otherwise turn harmless stderr output of native tools
# (pip/npm warnings) into terminating errors. Critical steps check $LASTEXITCODE instead.
$ErrorActionPreference = 'Continue'
function Need($what) { if ($LASTEXITCODE -ne 0) { Stop-Transcript | Out-Null; throw "$what failed (exit $LASTEXITCODE). See log." } }
$ProgressPreference = 'SilentlyContinue'
if ($All) { $WhisperX = $true; $ComfyUI = $true; $OpenMontage = $true; $Models = $true }
$Repo = Split-Path -Parent $PSScriptRoot           # ...\AI-VIDEO-STUDIO inside the git checkout
New-Item -ItemType Directory -Force -Path $StudioDir | Out-Null
$LogDir = Join-Path $StudioDir 'logs'; New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Log = Join-Path $LogDir ("install-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))
Start-Transcript -Path $Log -Append | Out-Null
$Report = [ordered]@{}

function Say($m, $c = 'Cyan') { Write-Host "`n==> $m" -ForegroundColor $c }
function Ok($m)   { Write-Host "  [OK]   $m" -ForegroundColor Green }
function Warn($m) { Write-Host "  [WARN] $m" -ForegroundColor Yellow }
function Ask($q) {
  if ($Yes) { return $true }
  $a = Read-Host "  $q [y/N]"
  return $a -match '^(y|yes)$'
}
function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path', 'User')
}
function Has($cmd) { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Winget-Install($id, $name, [switch]$User, [switch]$MayNeedAdmin) {
  $listed = winget list --id $id -e --accept-source-agreements 2>$null | Out-String
  if ($listed -match [regex]::Escape($id)) { Ok "$name already installed (winget: $id)"; return }
  if ($MayNeedAdmin -and -not (Ask "$name installer may show a Windows administrator (UAC) prompt. Continue?")) {
    Warn "$name skipped by user"; return
  }
  $wargs = @('install', '--id', $id, '-e', '--silent', '--accept-package-agreements', '--accept-source-agreements')
  if ($User) { $wargs += @('--scope', 'user') }
  & winget @wargs
  if ($LASTEXITCODE -ne 0 -and $User) { & winget install --id $id -e --silent --accept-package-agreements --accept-source-agreements }
  Refresh-Path
  Ok "$name installed"
}

# ------------------------------------------------------------------ 1. system inspection
Say 'System inspection'
$os  = Get-CimInstance Win32_OperatingSystem
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$gpus = Get-CimInstance Win32_VideoController
$ramGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
$drive = (Get-Item $StudioDir).PSDrive
$freeGB = [math]::Round((Get-PSDrive $drive.Name).Free / 1GB, 1)
$vramGB = 0; $cuda = $false; $gpuName = ($gpus | Select-Object -First 1).Name
if (Has 'nvidia-smi') {
  $q = (nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits | Select-Object -First 1) -split ','
  $gpuName = $q[0].Trim(); $vramGB = [math]::Round([double]$q[1] / 1024, 1); $cuda = $true
}
$Report.hardware = [ordered]@{ windows = "$($os.Caption) $($os.Version)"; cpu = $cpu.Name.Trim();
  cores = $cpu.NumberOfCores; ram_gb = $ramGB; gpu = $gpuName; vram_gb = $vramGB; cuda = $cuda; free_disk_gb = $freeGB }
$Report.hardware.GetEnumerator() | ForEach-Object { Write-Host ("  {0,-14} {1}" -f $_.Key, $_.Value) }
if ($freeGB -lt 15) { Warn "Less than 15 GB free on $($drive.Name): - optional AI components will be skipped"; $WhisperX = $false; $ComfyUI = $false }
if (-not (Has 'winget')) { throw 'winget (App Installer) is required: install "App Installer" from the Microsoft Store, then re-run.' }

# ------------------------------------------------------------------ 2. base dependencies
Say 'Base dependencies (only missing ones are installed)'
if (Has 'git') { Ok "Git $(git --version)" } else { Winget-Install 'Git.Git' 'Git' -MayNeedAdmin }
$py = $null
foreach ($v in '3.12', '3.11', '3.13') { try { $p = & py "-$v" -c "import sys;print(sys.executable)" 2>$null; if ($LASTEXITCODE -eq 0 -and $p) { $py = $p.Trim(); break } } catch {} }
if (-not $py) {
  Winget-Install 'Python.Python.3.12' 'Python 3.12' -User
  $py = (& py -3.12 -c "import sys;print(sys.executable)").Trim()
}
Ok "Python: $py"
if (Has 'node') { Ok "Node.js $(node -v)" } else { Winget-Install 'OpenJS.NodeJS.LTS' 'Node.js LTS' -MayNeedAdmin }
if (Has 'ffmpeg') { Ok "FFmpeg present: $((ffmpeg -version | Select-Object -First 1))" } else { Winget-Install 'Gyan.FFmpeg' 'FFmpeg (gyan.dev full build, libass+HarfBuzz)' -User }
$blender = Get-ChildItem "$env:ProgramFiles\Blender Foundation\*\blender.exe" -ErrorAction SilentlyContinue | Sort-Object FullName | Select-Object -Last 1
if ($blender) { Ok "Blender: $($blender.FullName)" }
elseif (Ask 'Install Blender (~400 MB download, official blender.org package via winget)?') {
  Winget-Install 'BlenderFoundation.Blender' 'Blender' -MayNeedAdmin
  $blender = Get-ChildItem "$env:ProgramFiles\Blender Foundation\*\blender.exe" -ErrorAction SilentlyContinue | Sort-Object FullName | Select-Object -Last 1
}
Refresh-Path

# ------------------------------------------------------------------ 3. studio files (never overwrite)
Say "Creating studio at $StudioDir (existing files are kept)"
if ((Resolve-Path $Repo).Path -ne (Resolve-Path $StudioDir).Path) {
  robocopy $Repo $StudioDir /E /XC /XN /XO /XD node_modules envs tools models /NFL /NDL /NJH /NJS /NP | Out-Null
}
foreach ($d in 'input','audio','footage','images','music','fonts','subtitles','scenes','scripts','templates','projects','previews','output','logs','envs','tools','models') {
  New-Item -ItemType Directory -Force -Path (Join-Path $StudioDir $d) | Out-Null
}
Ok 'Folders ready'

# ------------------------------------------------------------------ 4. core Python environment
Say 'Core Python environment (envs\core)'
$core = Join-Path $StudioDir 'envs\core'
if (-not (Test-Path "$core\Scripts\python.exe")) { & $py -m venv $core; Need 'Creating venv' }
$cpy = "$core\Scripts\python.exe"
& $cpy -m pip install --upgrade pip wheel | Out-Null
& $cpy -m pip install -r (Join-Path $StudioDir 'install\requirements-core.txt'); Need 'Core Python packages'
$torchIndex = if ($cuda) { 'https://download.pytorch.org/whl/cu128' } else { 'https://download.pytorch.org/whl/cpu' }
$torchSize = if ($cuda) { '~2.5 GB (CUDA build for your NVIDIA GPU)' } else { '~250 MB (CPU build)' }
if (Ask "Install PyTorch + Torchaudio $torchSize from pytorch.org?") {
  & $cpy -m pip install torch torchaudio --index-url $torchIndex
}
& $cpy -m playwright install chromium
Ok 'Core environment ready'

# ------------------------------------------------------------------ 5. Arabic fonts (per-user, no admin)
Say 'Arabic fonts (OFL licensed, installed for the current user)'
& $cpy (Join-Path $StudioDir 'scripts\fetch_fonts.py') (Join-Path $StudioDir 'fonts')
$userFonts = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
New-Item -ItemType Directory -Force -Path $userFonts | Out-Null
$reg = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
Get-ChildItem (Join-Path $StudioDir 'fonts\*.ttf') | ForEach-Object {
  $dest = Join-Path $userFonts $_.Name
  if (-not (Test-Path $dest)) { Copy-Item $_.FullName $dest }
  New-ItemProperty -Path $reg -Name "$($_.BaseName) (TrueType)" -Value $dest -PropertyType String -Force | Out-Null
}
Ok 'Fonts installed: Aref Ruqaa, Aref Ruqaa Ink, Amiri, Cairo, Tajawal, Noto Naskh/Sans Arabic, Reem Kufi, IBM Plex Sans Arabic'

# ------------------------------------------------------------------ 6. Blender Arabic support
if ($blender) {
  Say 'Blender: Arabic shaping helpers'
  $bpy = Get-ChildItem (Join-Path $blender.DirectoryName '*\python\bin\python.exe') | Select-Object -First 1
  $site = Join-Path $StudioDir 'envs\blender-site'
  & $bpy.FullName -m ensurepip | Out-Null
  & $bpy.FullName -m pip install --upgrade --target $site arabic-reshaper python-bidi
  Ok "Blender helpers in $site"
}

# ------------------------------------------------------------------ 7. Node projects: Remotion + Motion Canvas
Say 'Remotion and Motion Canvas'
foreach ($p in 'templates\remotion', 'templates\motion-canvas') {
  $dir = Join-Path $StudioDir $p
  New-Item -ItemType Directory -Force -Path (Join-Path $dir 'public\fonts') | Out-Null
  Copy-Item (Join-Path $StudioDir 'fonts\*.ttf') (Join-Path $dir 'public\fonts') -Force
  Push-Location $dir; npm install --no-audit --no-fund; Need "npm install ($p)"; Pop-Location
}
Push-Location (Join-Path $StudioDir 'templates\remotion'); npx remotion browser ensure; Pop-Location
Push-Location (Join-Path $StudioDir 'templates\motion-canvas'); npx playwright install chromium; Pop-Location
Ok 'Remotion + Motion Canvas ready'

# ------------------------------------------------------------------ 8. optional AI components
if ($WhisperX -and (Ask "Install WhisperX in envs\whisperx ($torchSize + ~500 MB)?")) {
  Say 'WhisperX (isolated environment)'
  $wx = Join-Path $StudioDir 'envs\whisperx'
  if (-not (Test-Path "$wx\Scripts\python.exe")) { & $py -m venv $wx }
  & "$wx\Scripts\python.exe" -m pip install --upgrade pip | Out-Null
  & "$wx\Scripts\python.exe" -m pip install torch torchaudio --index-url $torchIndex
  & "$wx\Scripts\python.exe" -m pip install whisperx
  Ok 'WhisperX installed'
}
if ($ComfyUI -and (Ask "Install ComfyUI in tools\ComfyUI ($torchSize, models not included)?")) {
  Say 'ComfyUI (isolated environment)'
  $cdir = Join-Path $StudioDir 'tools\ComfyUI'
  if (-not (Test-Path "$cdir\main.py")) { git clone --depth 1 https://github.com/comfyanonymous/ComfyUI.git $cdir }
  $cv = Join-Path $StudioDir 'envs\comfyui'
  if (-not (Test-Path "$cv\Scripts\python.exe")) { & $py -m venv $cv }
  & "$cv\Scripts\python.exe" -m pip install --upgrade pip | Out-Null
  & "$cv\Scripts\python.exe" -m pip install torch torchvision torchaudio --index-url $torchIndex
  & "$cv\Scripts\python.exe" -m pip install -r "$cdir\requirements.txt"
  Ok 'ComfyUI installed (start it from START-STUDIO.bat)'
  if ($Models) {
    if ($vramGB -ge 6) {
      $url = 'https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/resolve/main/v1-5-pruned-emaonly-fp16.safetensors'
      if (Ask "Download Stable Diffusion 1.5 checkpoint (~2 GB, CreativeML OpenRAIL-M) for ComfyUI?") {
        Invoke-WebRequest $url -OutFile "$cdir\models\checkpoints\v1-5-pruned-emaonly-fp16.safetensors"
      }
    } else { Warn "GPU VRAM $vramGB GB: local image generation not recommended; procedural scenes will be used." }
  }
}
if ($OpenMontage) {
  Say 'OpenMontage (AGPL-3.0)'
  $om = Join-Path $StudioDir 'tools\OpenMontage'
  if (-not (Test-Path $om)) {
    git clone --depth 1 https://github.com/calesthio/OpenMontage.git $om
    if ($LASTEXITCODE -ne 0) { git clone --depth 1 https://github.com/OpenMontageInc/OpenMontage.git $om }
  }
  if (Test-Path $om) { Ok "OpenMontage cloned to $om (open that folder in Claude Code to use its agent pipelines)" }
  else { Warn 'OpenMontage repository unavailable - skipped' }
}
if ($Models) {
  $wm = if ($vramGB -ge 8) { 'large-v3' } elseif ($vramGB -ge 5) { 'medium' } else { 'small' }
  if (Ask "Pre-download Whisper '$wm' model for Arabic (small ~0.5 GB, medium ~1.5 GB, large-v3 ~3 GB)?") {
    $env:HF_HOME = Join-Path $StudioDir 'models\hf'
    & $cpy -c "from faster_whisper import WhisperModel; WhisperModel('$wm', device='cpu', compute_type='int8')"
  }
}

# ------------------------------------------------------------------ 9. launcher + tests
Say 'Launcher'
$bat = Join-Path $StudioDir 'START-STUDIO.bat'
if (-not (Test-Path $bat)) { Copy-Item (Join-Path $Repo 'START-STUDIO.bat') $bat }
$lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'AI-VIDEO-STUDIO.lnk'
if (-not (Test-Path $lnk)) {
  $s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk); $s.TargetPath = $bat; $s.WorkingDirectory = $StudioDir; $s.Save()
}
Ok "START-STUDIO.bat + desktop shortcut"

Push-Location $StudioDir
& $cpy studio.py doctor
if (-not $SkipTests) { Say 'Automatic test suite'; & $cpy studio.py test }
Pop-Location
Stop-Transcript | Out-Null
Say "Done. Final test video: $StudioDir\output\STUDIO-TEST.mp4   Log: $Log" 'Green'
