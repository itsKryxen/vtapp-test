$content = Get-Content 'C:\Users\91996\.gemini\antigravity-ide\brain\5a235047-15f1-4c92-925b-a49af2da3437\.system_generated\steps\75\content.md' -Raw
$regex = [regex]'"videoId"\s*:\s*"([A-Za-z0-9_-]{11})"'
$allMatches = $regex.Matches($content)
$seen = @{}
foreach ($m in $allMatches) {
    $id = $m.Groups[1].Value
    if (-not $seen.ContainsKey($id)) {
        $seen[$id] = $true
        Write-Output $id
    }
}
