$ErrorActionPreference = "SilentlyContinue"

# Get all tsx files in the ui components directory
$files = Get-ChildItem "c:\Users\Asus\OneDrive\Desktop\AI Girlie\WaifuCore\Frontend\src\components\ui" -Filter "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace the corrupted inline cn function with proper import
    $pattern = '// Simple className utility function.*?n\}'
    $replacement = 'import { cn } from "@/lib/utils"'
    
    if ($content -match $pattern) {
        Write-Host "Fixing $($file.Name)"
        $newContent = $content -replace $pattern, $replacement
        Set-Content -Path $file.FullName -Value $newContent
    }
}

Write-Host "All files processed!"
