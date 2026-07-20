; SmartGuide AI - Inno Setup Installer
; Download Inno Setup: https://jrsoftware.org/isinfo.php

[Setup]
AppName=SmartGuide AI
AppVersion=1.0
AppPublisher=FitFocusHub
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

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\server\*"; DestDir: "{app}\server"; Flags: recursesubdirs
Source: "..\browser-extension\*"; DestDir: "{app}\browser-extension"; Flags: recursesubdirs
Source: "..\start_server.bat"; DestDir: "{app}"
Source: "..\install.bat"; DestDir: "{app}"
Source: "..\README.md"; DestDir: "{app}"

[Icons]
Name: "{group}\Start SmartGuide Server"; Filename: "{app}\start_server.bat"; WorkingDir: "{app}"
Name: "{group}\SmartGuide Folder"; Filename: "{app}"
Name: "{group}\Uninstall SmartGuide"; Filename: "{uninstallexe}"
Name: "{commondesktop}\SmartGuide Server"; Filename: "{app}\start_server.bat"; WorkingDir: "{app}"

[Run]
Filename: "{app}\start_server.bat"; Description: "Start SmartGuide Server now"; Flags: postinstall nowait

[Code]
function InitializeSetup: Boolean;
begin
  Result := True;
end;
