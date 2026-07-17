; SmartGuide AI Installer Script for Inno Setup
; Download Inno Setup from: https://jrsoftware.org/isinfo.php

[Setup]
AppName=SmartGuide AI
AppVersion=1.1.0
AppPublisher=SmartGuide AI
AppPublisherURL=https://github.com/your-username/SmartGuide-AI
DefaultDirName={autopf}\SmartGuide AI
DefaultGroupName=SmartGuide AI
OutputDir=installer_output
OutputBaseFilename=SmartGuideAI_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "desktop-app\*"; DestDir: "{app}\desktop-app"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "browser-extension\*"; DestDir: "{app}\browser-extension"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "mobile-app\*"; DestDir: "{app}\mobile-app"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\SmartGuide AI"; Filename: "{app}\Start SmartGuide AI.bat"
Name: "{group}\Uninstall SmartGuide AI"; Filename: "{uninstallexe}"
Name: "{autodesktop}\SmartGuide AI"; Filename: "{app}\Start SmartGuide AI.bat"

[Run]
Filename: "{app}\Start SmartGuide AI.bat"; Description: "Start SmartGuide AI now"; Flags: nowait postinstall skipifsilent

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
var
  StartScript: string;
  UninstallScript: string;
begin
  if CurStep = ssPostInstall then
  begin
    // Create start script
    StartScript := ExpandConstant('{app}\Start SmartGuide AI.bat');
    SaveStringToFile(StartScript, 
      '@echo off' + #13#10 +
      'echo Starting SmartGuide AI...' + #13#10 +
      'cd "' + ExpandConstant('{app}\desktop-app') + '"' + #13#10 +
      'python main.py' + #13#10 +
      'pause', False);
    
    // Create uninstaller script
    UninstallScript := ExpandConstant('{app}\Uninstall.bat');
    SaveStringToFile(UninstallScript,
      '@echo off' + #13#10 +
      'echo Uninstalling SmartGuide AI...' + #13#10 +
      'pause' + #13#10 +
      'rmdir /s /q "' + ExpandConstant('{app}') + '"' + #13#10 +
      'echo Uninstalled!' + #13#10 +
      'pause', False);
  end;
end;
