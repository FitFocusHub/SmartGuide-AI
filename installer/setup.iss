; SmartGuide AI - Professional Installer
; Inno Setup Script

[Setup]
AppName=SmartGuide AI
AppVersion=1.0
AppPublisher=FitFocusHub
AppPublisherURL=https://github.com/FitFocusHub/SmartGuide-AI
DefaultDirName={userappdata}\SmartGuide AI
DefaultGroupName=SmartGuide AI
OutputDir=installer_output
OutputBaseFilename=Server
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
UninstallDisplayName=SmartGuide AI
UninstallDisplayIcon={app}\server\server_silent.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create Desktop shortcut"; GroupDescription: "Additional icons:"; Flags: checkedonce
Name: "startup"; Description: "Start with Windows"; GroupDescription: "Auto-start:"; Flags: checkedonce

[Files]
Source: "..\server\*"; DestDir: "{app}\server"; Flags: recursesubdirs ignoreversion
Source: "..\browser-extension\*"; DestDir: "{app}\browser-extension"; Flags: recursesubdirs ignoreversion

[Icons]
Name: "{group}\SmartGuide AI"; Filename: "{app}\browser-extension"
Name: "{group}\Uninstall SmartGuide"; Filename: "{uninstallexe}"
Name: "{commondesktop}\SmartGuide AI"; Filename: "{app}\browser-extension"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "SmartGuideAI"; ValueData: """{app}\server\start_silent.bat"""; Tasks: startup; Flags: uninsdeletevalue

[Run]
; Install Python dependencies silently
Filename: "cmd.exe"; Parameters: "/c cd /d ""{app}\server"" && pip install websockets pyautogui pyperclip psutil Pillow --quiet --disable-pip-version-check 2>nul"; StatusMsg: "Installing dependencies..."; Flags: runhidden
; Start server silently in background
Filename: "cmd.exe"; Parameters: "/c cd /d ""{app}\server"" && start /b pythonw server_silent.py"; StatusMsg: "Starting server..."; Flags: postinstall nowait runhidden

[Code]
function InitializeSetup: Boolean;
begin
  Result := True;
end;
