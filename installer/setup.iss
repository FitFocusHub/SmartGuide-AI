; SmartGuide AI - Inno Setup Installer
; Download Inno Setup: https://jrsoftware.org/isinfo.php

[Setup]
AppName=SmartGuide AI
AppVersion=1.0
AppPublisher=FitFocusHub
AppPublisherURL=https://github.com/FitFocusHub/SmartGuide-AI
DefaultDirName={userappdata}\SmartGuide AI
DefaultGroupName=SmartGuide AI
OutputDir=installer_output
OutputBaseFilename=SmartGuideAI-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayName=SmartGuide AI
UninstallDisplayIcon={app}\server\server.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create Desktop shortcut"; GroupDescription: "Additional icons:"; Flags: checkedonce
Name: "startup"; Description: "Start server on Windows startup"; GroupDescription: "Auto-start:"

[Files]
Source: "..\server\*"; DestDir: "{app}\server"; Flags: recursesubdirs ignoreversion
Source: "..\browser-extension\*"; DestDir: "{app}\browser-extension"; Flags: recursesubdirs ignoreversion
Source: "..\start_server.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\install.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Start SmartGuide Server"; Filename: "{app}\start_server.bat"; WorkingDir: "{app}"
Name: "{group}\SmartGuide Folder"; Filename: "{app}"
Name: "{group}\Uninstall SmartGuide"; Filename: "{uninstallexe}"
Name: "{commondesktop}\SmartGuide Server"; Filename: "{app}\start_server.bat"; WorkingDir: "{app}"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "SmartGuideAI"; ValueData: """{app}\start_server.bat"""; Tasks: startup; Flags: uninsdeletevalue

[Run]
; Install Python dependencies
Filename: "cmd.exe"; Parameters: "/c pip install websockets pyautogui pyperclip psutil Pillow 2>nul"; StatusMsg: "Installing dependencies..."; Flags: runhidden
; Start server in background AFTER install
Filename: "cmd.exe"; Parameters: "/c start /b ""SmartGuide Server"" cmd /c cd /d ""{app}"" && start_server.bat"; StatusMsg: "Starting server..."; Flags: postinstall nowait runhidden
; Show completion message
Filename: "cmd.exe"; Parameters: "/c echo. && echo SmartGuide AI installed successfully! && echo Server is running in background. && echo. && echo To load extension: && echo 1. Open chrome://extensions/ && echo 2. Enable Developer mode && echo 3. Click Load unpacked && echo 4. Select: {app}\browser-extension && echo. && pause"; Description: "Show installation complete message"; Flags: postinstall nowait

[Code]
function InitializeSetup: Boolean;
begin
  Result := True;
end;
