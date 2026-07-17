[Setup]
AppName=SmartGuide AI
AppVersion=2.0.0
AppPublisher=FitFocusHub
AppPublisherURL=https://github.com/FitFocusHub/SmartGuide-AI
DefaultDirName={autopf}\SmartGuide AI
DefaultGroupName=SmartGuide AI
OutputDir=dist
OutputBaseFilename=SmartGuideAI_Setup
Compression=lzma2
SolidCompression=yes
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\SmartGuideAI.exe
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverriding=lowest

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: checkedonce
Name: "startup"; Description: "Start with Windows"; GroupDescription: "Startup:"; Flags: checkedonce

[Files]
Source: "dist\SmartGuideAI.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: ".env"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\SmartGuide AI"; Filename: "{app}\SmartGuideAI.exe"
Name: "{group}\Uninstall SmartGuide AI"; Filename: "{uninstallexe}"
Name: "{autodesktop}\SmartGuide AI"; Filename: "{app}\SmartGuideAI.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\SmartGuideAI.exe"; Description: "Launch SmartGuide AI now"; Flags: nowait postinstall skipifsilent

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "SmartGuideAI"; ValueData: """{app}\SmartGuideAI.exe"""; Flags: uninsdeletevalue; Tasks: startup

[Code]
function InitializeSetup: Boolean;
begin
  Result := True;
end;
