[Setup]
AppName=SmartGuide AI
AppVersion=1.2.0
AppPublisher=FitFocusHub
DefaultDirName={autopf}\SmartGuide AI
DefaultGroupName=SmartGuide AI
OutputDir=dist
OutputBaseFilename=SmartGuideAI_Setup
Compression=lzma2
SolidCompression=yes
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\floating_chat.exe
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: checkedonce

[Files]
Source: "floating_chat.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "main.py"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\browser-extension\*"; DestDir: "{app}\browser-extension"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".env"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "requirements.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\SmartGuide AI"; Filename: "{app}\floating_chat.exe"
Name: "{group}\Uninstall SmartGuide AI"; Filename: "{uninstallexe}"
Name: "{autodesktop}\SmartGuide AI"; Filename: "{app}\floating_chat.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\floating_chat.exe"; Description: "Launch SmartGuide AI now"; Flags: nowait postinstall skipifsilent
