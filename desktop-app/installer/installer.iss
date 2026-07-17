block = """
[Setup]
AppName=SmartGuide AI
AppVersion=1.0.0
DefaultDirName={autopf}\SmartGuide AI
DefaultGroupName=SmartGuide AI
OutputDir=installer\output
OutputBaseFilename=SmartGuideAI_Setup_1.0.0

[Files]
Source: "dist\main\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{group}\SmartGuide AI"; Filename: "{app}\main.exe"
Name: "{group}\Uninstall SmartGuide AI"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\main.exe"; Description: "Launch SmartGuide AI"; Flags: postinstall
"""
