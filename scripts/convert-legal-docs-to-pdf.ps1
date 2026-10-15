# One-off conversion script: turns the .doc files under
# "Сайтга қўйиладиган ҳужжатлар" (qonunlar/farmonlar/qarorlar delivered as
# Word files) into PDFs under public/qonunchilik/, and writes a JSON
# manifest (src/data/qonunchilikHujjatlari.json) describing each document
# (category/subfolder/title/url/lang) for AiAssistantPage / ExpertAssistant
# grounding. Requires MS Word installed on Windows (uses COM automation) —
# not part of the app build, run manually whenever new source .doc files
# are added to the source folder.
#
# NOTE: destination PDF filenames are deliberately ASCII-only (slug + running
# number) — Word's SaveAs COM call reliably fails ("Cannot convert ...
# psobject to Object") when the destination path contains Cyrillic
# characters, even though Documents.Open handles Cyrillic source paths fine.
# ExportAsFixedFormat is used instead of SaveAs (also avoids that bug).
#
# NOTE: each file is converted in its own Word process with a timeout,
# because some source .doc files (flagged Zone.Identifier / "downloaded
# from the internet") can make Word pop an invisible, blocking dialog
# (Protected View) that hangs forever with Visible=$false.
#
# Usage: powershell -File scripts/convert-legal-docs-to-pdf.ps1 -SrcRoot "<path to source folder>"

param(
  [Parameter(Mandatory = $true)]
  [string]$SrcRoot,
  [int]$TimeoutSec = 30
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$srcRoot = (Resolve-Path $SrcRoot).Path
$dstRoot = Join-Path $root "public\qonunchilik"
$manifestPath = Join-Path $root "src\data\qonunchilikHujjatlari.json"

if (-not (Test-Path $dstRoot)) { New-Item -ItemType Directory -Path $dstRoot -Force | Out-Null }

$categorySlugs = @{
  'Ўзбекистон Республикаси Президенти Фармонлари' = 'prezident-farmoni'
  'Ўзбекистон Республикаси Президенти қарорлари'  = 'prezident-qarori'
  'Вазирлар Маҳкамаси қарорлари'                  = 'vm-qarori'
  'Қонунлар'                                       = 'qonun'
}

function Get-Lang($filename) {
  if ($filename -match 'ўзбекча') { return 'uz-kril' }
  if ($filename -match 'русча') { return 'ru' }
  if ($filename -match '[ЎўҚқҒғҲҳ]') { return 'uz-kril' }
  return 'ru'
}

$jobScript = {
  param($srcPath, $dstPath)
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  try {
    $doc = $word.Documents.Open($srcPath, $false, $true)
    $doc.ExportAsFixedFormat($dstPath, 17)
    $doc.Close([ref]0)
  } finally {
    $word.Quit()
  }
}

$manifest = [System.Collections.Generic.List[object]]::new()
$failed = [System.Collections.Generic.List[object]]::new()
$counters = @{}

Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$files = Get-ChildItem -Recurse -File -Filter *.doc $srcRoot | Sort-Object FullName
$count = 0
foreach ($f in $files) {
  $rel = $f.FullName.Substring($srcRoot.Length + 1)
  $parts = $rel -split '\\'
  $category = $parts[0]
  $subfolder = if ($parts.Length -gt 2) { $parts[1] } else { '' }
  $filenameNoExt = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)

  $slugBase = $categorySlugs[$category]
  if (-not $slugBase) { $slugBase = 'hujjat' }
  if (-not $counters.ContainsKey($slugBase)) { $counters[$slugBase] = 0 }
  $counters[$slugBase]++
  $slug = "{0}-{1:D2}" -f $slugBase, $counters[$slugBase]
  $dstPath = Join-Path $dstRoot "$slug.pdf"

  $job = Start-Job -ScriptBlock $jobScript -ArgumentList $f.FullName, $dstPath
  $done = Wait-Job $job -Timeout $TimeoutSec
  $count++

  if (-not $done -or $job.State -ne 'Completed' -or -not (Test-Path $dstPath)) {
    Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
    Get-Process WINWORD -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Output "[$count/$($files.Count)] FAILED: $rel"
    $failed.Add([ordered]@{ path = $rel; slug = $slug })
    continue
  }
  Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null

  Write-Output "[$count/$($files.Count)] $rel -> $slug.pdf"
  $manifest.Add([ordered]@{
    slug      = $slug
    category  = $category
    subfolder = $subfolder
    title     = $filenameNoExt
    lang      = Get-Lang $filenameNoExt
    url       = "/qonunchilik/$slug.pdf"
  })
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding utf8

if ($failed.Count -gt 0) {
  Write-Output "Failed ($($failed.Count)):"
  $failed | ForEach-Object { Write-Output "  - $($_.path)" }
}
Write-Output "Done. $($manifest.Count)/$($files.Count) converted. Manifest written to $manifestPath"
