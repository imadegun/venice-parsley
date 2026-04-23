@echo off
echo ================================================
echo   DUMP DATABASE: Supabase
echo ================================================

:: ---- KONFIGURASI ----
set SUPABASE_URL=postgresql://postgres.zhdmgvhwrmstapywvfmu:dcnhmNIGpJ9w6IYs@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres

set PG_BIN=C:\Program Files\PostgreSQL\17\bin
set BACKUP_FILE=full_backup.sql

:: ---- EXPORT DARI SUPABASE ----
echo.
echo [1/2] Mengexport semua tabel dari Supabase...
"%PG_BIN%\pg_dump.exe" "%SUPABASE_URL%" ^
  --no-owner ^
  --no-acl ^
  --no-privileges ^
  --schema=public ^
  -f %BACKUP_FILE%

if %ERRORLEVEL% NEQ 0 (
    echo GAGAL export dari Supabase!
    pause
    exit /b 1
)
echo Export SUKSES! File: %BACKUP_FILE%

echo.
echo ================================================
echo   MIGRASI SELESAI!
echo ================================================
pause