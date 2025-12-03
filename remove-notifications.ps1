# Script to remove notification method calls from all JSX files
# This script will:
# 1. Remove showSuccess, showError, showInfo, showWarning from useUIStore destructuring
# 2. Comment out or remove notification calls
# 3. Add console.log/console.error as replacements

$files = @(
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\components\usuario\UserProfileOptimized.jsx",
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\components\rutinas\RutinaGlobalOptimized.jsx",
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\components\rutinas\InfoEjercicioCardOptimized.jsx",
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\components\rutinas\FormularioOptimized.jsx",
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\components\rutinas\CustomRoutineBuilder.jsx",
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\components\progreso\ProfessionalWorkoutTracker.jsx",
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\components\progreso\ExerciseLogCard.jsx",
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\components\common\ErrorBoundaryOptimized.jsx",
    "c:\Users\maxim\OneDrive\Desktop\Programacion\gb-tp\src\hooks\useProfessionalTracking.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Remove from destructuring patterns
        $content = $content -replace ', showSuccess', ''
        $content = $content -replace ', showError', ''
        $content = $content -replace ', showInfo', ''
        $content = $content -replace ', showWarning', ''
        $content = $content -replace 'showSuccess, ', ''
        $content = $content -replace 'showError, ', ''
        $content = $content -replace 'showInfo, ', ''
        $content = $content -replace 'showWarning, ', ''
        
        # Replace notification calls with console logging
        $content = $content -replace 'showSuccess\(([^)]+)\)', '// Removed notification: showSuccess($1)'
        $content = $content -replace 'showError\(([^)]+)\)', 'console.error($1)'
        $content = $content -replace 'showInfo\(([^)]+)\)', '// Removed notification: showInfo($1)'
        $content = $content -replace 'showWarning\(([^)]+)\)', 'console.warn($1)'
        
        # Save the modified content
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Processed: $file"
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Green
