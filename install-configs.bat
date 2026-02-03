@echo off
REM ============================================================
REM zahrs-skill MCP Server - Installation Script
REM ============================================================
REM This script installs zahrs-skill config ke berbagai AI tools
REM ============================================================

echo.
echo ============================================================
echo zahrs-skill MCP Server - Installation Script
echo ============================================================
echo.

SET ZAHRS_PATH=C:\Users\Rekabit\zahrs-skill\src\index.js

REM Check if node is available
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] Node.js found

REM ============================================================
REM 1. Claude Desktop
REM ============================================================
echo.
echo [1/4] Configuring Claude Desktop...

SET CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json

if not exist "%APPDATA%\Claude" (
    mkdir "%APPDATA%\Claude"
)

REM Check if config exists
if exist "%CLAUDE_CONFIG%" (
    echo      Config exists, checking for zahrs-skill...
    findstr /C:"zahrs-skill" "%CLAUDE_CONFIG%" >nul
    if %ERRORLEVEL% equ 0 (
        echo      [OK] zahrs-skill already configured
    ) else (
        echo      [INFO] Please manually add zahrs-skill to %CLAUDE_CONFIG%
    )
) else (
    echo      Creating new config...
    echo { > "%CLAUDE_CONFIG%"
    echo   "mcpServers": { >> "%CLAUDE_CONFIG%"
    echo     "zahrs-skill": { >> "%CLAUDE_CONFIG%"
    echo       "command": "node", >> "%CLAUDE_CONFIG%"
    echo       "args": ["C:/Users/Rekabit/zahrs-skill/src/index.js"] >> "%CLAUDE_CONFIG%"
    echo     } >> "%CLAUDE_CONFIG%"
    echo   } >> "%CLAUDE_CONFIG%"
    echo } >> "%CLAUDE_CONFIG%"
    echo      [OK] Created
)

REM ============================================================
REM 2. Antigravity (Gemini)
REM ============================================================
echo.
echo [2/4] Configuring Antigravity...

SET ANTIGRAVITY_CONFIG=%USERPROFILE%\.antigravity\mcp_config.json

if not exist "%USERPROFILE%\.antigravity" (
    mkdir "%USERPROFILE%\.antigravity"
)

echo { > "%ANTIGRAVITY_CONFIG%"
echo   "mcpServers": { >> "%ANTIGRAVITY_CONFIG%"
echo     "zahrs-skill": { >> "%ANTIGRAVITY_CONFIG%"
echo       "command": "node", >> "%ANTIGRAVITY_CONFIG%"
echo       "args": ["C:/Users/Rekabit/zahrs-skill/src/index.js"] >> "%ANTIGRAVITY_CONFIG%"
echo     } >> "%ANTIGRAVITY_CONFIG%"
echo   } >> "%ANTIGRAVITY_CONFIG%"
echo } >> "%ANTIGRAVITY_CONFIG%"
echo      [OK] Created %ANTIGRAVITY_CONFIG%

REM ============================================================
REM 3. Codex (OpenAI)
REM ============================================================
echo.
echo [3/4] Configuring Codex...

SET CODEX_CONFIG=%USERPROFILE%\.codex\mcp_config.json

if not exist "%USERPROFILE%\.codex" (
    mkdir "%USERPROFILE%\.codex"
)

echo { > "%CODEX_CONFIG%"
echo   "mcpServers": { >> "%CODEX_CONFIG%"
echo     "zahrs-skill": { >> "%CODEX_CONFIG%"
echo       "command": "node", >> "%CODEX_CONFIG%"
echo       "args": ["C:/Users/Rekabit/zahrs-skill/src/index.js"] >> "%CODEX_CONFIG%"
echo     } >> "%CODEX_CONFIG%"
echo   } >> "%CODEX_CONFIG%"
echo } >> "%CODEX_CONFIG%"
echo      [OK] Created %CODEX_CONFIG%

REM ============================================================
REM 4. Test server
REM ============================================================
echo.
echo [4/4] Testing MCP server...
cd /d C:\Users\Rekabit\zahrs-skill
call npm install --silent >nul 2>nul
echo      Starting server test...
echo {"jsonrpc":"2.0","id":1,"method":"tools/list"} | node src/index.js 2>nul | findstr /C:"tools" >nul
if %ERRORLEVEL% equ 0 (
    echo      [OK] Server responding correctly
) else (
    echo      [WARN] Server test inconclusive, but may still work
)

REM ============================================================
REM Done
REM ============================================================
echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo Configs created:
echo   - Claude Desktop: %CLAUDE_CONFIG%
echo   - Antigravity:    %ANTIGRAVITY_CONFIG%
echo   - Codex:          %CODEX_CONFIG%
echo.
echo Server path: %ZAHRS_PATH%
echo.
echo Next steps:
echo   1. Restart your AI coding tool
echo   2. The zahrs-skill tools should be available
echo.
pause
