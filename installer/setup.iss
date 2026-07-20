; SmartGuide AI - Inno Setup Installer
; Download Inno Setup: https://jrsoftware.org/isinfo.php

[Setup]
AppName=SmartGuide AI
AppVersion=1.0
AppPublisher=FitFocusHub
AppPublisherURL=https://github.com/FitFocusHub/SmartGuide-AI
DefaultDirName={autopf}\SmartGuide AI
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
Name: "startup"; Description: "Start server on Windows startup"; GroupDescription: "Auto-start:"; Flags: unchecked

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
Filename: "cmd.exe"; Parameters: "/c pip install websockets pyautogui pyperclip psutil Pillow"; StatusMsg: "Installing Python dependencies..."; Flags: runhidden
Filename: "{app}\start_server.bat"; Description: "Start SmartGuide Server now"; Flags: postinstall nowait skipifsilent

[Code]
function InitializeSetup: Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  
  if not FileExists(ExpandConstant('{cmd}')) then
  begin
    MsgBox('Command Prompt not found. Please install Windows.', mbError, MB_OK);
    Result := False;
    Exit;
  end;
end;
