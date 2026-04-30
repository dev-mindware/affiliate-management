# Run the project using the local virtual environment
Write-Host "🚀 Starting Mindware Affiliate System..." -ForegroundColor Cyan

if (-not (Test-Path ".venv")) {
    Write-Host "❌ Error: .venv directory not found." -ForegroundColor Red
    Write-Host "Please run 'python -m venv .venv' and install dependencies first."
    exit
}

# Start uvicorn
& .\.venv\Scripts\uvicorn app.main:app --reload
