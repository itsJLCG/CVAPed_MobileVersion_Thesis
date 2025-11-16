# Script to clear Metro bundler cache and restart Expo
Write-Host "Clearing Metro bundler cache..." -ForegroundColor Yellow

# Clear Metro bundler cache
npx expo start --clear

Write-Host "Metro bundler cache cleared and Expo started!" -ForegroundColor Green
