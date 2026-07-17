import os
import sys
import shutil
import subprocess
from pathlib import Path
import tkinter as tk
from tkinter import messagebox, ttk
import threading

class SmartGuideInstaller:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("SmartGuide AI Installer")
        self.root.geometry("500x400")
        self.root.resizable(False, False)
        
        # Colors
        self.bg_color = "#1a1a2e"
        self.accent_color = "#e94560"
        self.text_color = "#ffffff"
        
        self.root.configure(bg=self.bg_color)
        
        self.install_path = Path(os.environ['APPDATA']) / "SmartGuide AI"
        self.create_ui()
        
    def create_ui(self):
        # Header
        header = tk.Frame(self.root, bg=self.accent_color, height=80)
        header.pack(fill=tk.X)
        header.pack_propagate(False)
        
        tk.Label(header, text="🤖 SmartGuide AI", font=("Segoe UI", 24, "bold"), 
                bg=self.accent_color, fg=self.text_color).pack(pady=20)
        
        # Main content
        content = tk.Frame(self.root, bg=self.bg_color)
        content.pack(fill=tk.BOTH, expand=True, padx=30, pady=20)
        
        tk.Label(content, text="SmartGuide AI Installer", font=("Segoe UI", 16, "bold"),
                bg=self.bg_color, fg=self.text_color).pack(pady=(0, 10))
        
        tk.Label(content, text="Real-time AI Guidance for Any Software", 
                font=("Segoe UI", 10), bg=self.bg_color, fg="#aaaaaa").pack()
        
        # Install location
        tk.Label(content, text=f"Install Location:", font=("Segoe UI", 10),
                bg=self.bg_color, fg="#aaaaaa").pack(anchor=tk.W, pady=(20, 5))
        
        path_frame = tk.Frame(content, bg="#2a2a4a")
        path_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.path_var = tk.StringVar(value=str(self.install_path))
        tk.Entry(path_frame, textvariable=self.path_var, font=("Segoe UI", 10),
                bg="#2a2a4a", fg=self.text_color, insertbackground=self.text_color,
                relief=tk.FLAT, state='readonly').pack(fill=tk.X, padx=10, pady=8)
        
        # Progress bar
        self.progress = ttk.Progressbar(content, mode='determinate')
        self.progress.pack(fill=tk.X, pady=(10, 5))
        
        self.status_label = tk.Label(content, text="Ready to install", font=("Segoe UI", 9),
                                    bg=self.bg_color, fg="#aaaaaa")
        self.status_label.pack()
        
        # Buttons
        btn_frame = tk.Frame(self.root, bg=self.bg_color)
        btn_frame.pack(fill=tk.X, padx=30, pady=20)
        
        self.install_btn = tk.Button(btn_frame, text="Install", font=("Segoe UI", 12, "bold"),
                                    bg=self.accent_color, fg=self.text_color, relief=tk.FLAT,
                                    padx=30, pady=10, cursor="hand2", command=self.start_install)
        self.install_btn.pack(side=tk.RIGHT)
        
        cancel_btn = tk.Button(btn_frame, text="Cancel", font=("Segoe UI", 10),
                              bg="#4a4a6a", fg=self.text_color, relief=tk.FLAT,
                              padx=20, pady=10, cursor="hand2", command=self.root.destroy)
        cancel_btn.pack(side=tk.RIGHT, padx=(0, 10))
        
    def start_install(self):
        self.install_btn.config(state=tk.DISABLED)
        threading.Thread(target=self.install, daemon=True).start()
        
    def install(self):
        try:
            # Create install directory
            self.update_status("Creating installation folder...")
            self.install_path.mkdir(parents=True, exist_ok=True)
            self.progress['value'] = 10
            
            # Copy files
            source_dir = Path(__file__).parent.parent / "desktop-app"
            
            self.update_status("Copying desktop app files...")
            self.copy_folder(source_dir, self.install_path / "desktop-app")
            self.progress['value'] = 40
            
            # Copy extension
            source_ext = Path(__file__).parent.parent / "browser-extension"
            self.update_status("Copying browser extension...")
            self.copy_folder(source_ext, self.install_path / "browser-extension")
            self.progress['value'] = 60
            
            # Copy mobile app
            source_mobile = Path(__file__).parent.parent / "mobile-app"
            if source_mobile.exists():
                self.update_status("Copying mobile app...")
                self.copy_folder(source_mobile, self.install_path / "mobile-app")
            self.progress['value'] = 70
            
            # Create start menu shortcut
            self.update_status("Creating shortcuts...")
            self.create_shortcuts()
            self.progress['value'] = 85
            
            # Create uninstaller
            self.update_status("Creating uninstaller...")
            self.create_uninstaller()
            self.progress['value'] = 95
            
            # Create start script
            self.create_start_script()
            self.progress['value'] = 100
            
            self.update_status("Installation complete!")
            messagebox.showinfo("Success", "SmartGuide AI installed successfully!\n\n"
                              f"Location: {self.install_path}\n\n"
                              "To start: Run SmartGuide AI from Desktop or Start Menu")
            self.root.destroy()
            
        except Exception as e:
            messagebox.showerror("Error", f"Installation failed: {str(e)}")
            self.root.destroy()
    
    def copy_folder(self, src, dst):
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
    
    def create_shortcuts(self):
        # Desktop shortcut
        desktop = Path(os.environ['USERPROFILE']) / "Desktop"
        shortcut_path = desktop / "SmartGuide AI.bat"
        
        with open(shortcut_path, 'w') as f:
            f.write(f'@echo off\n')
            f.write(f'cd "{self.install_path / "desktop-app"}"\n')
            f.write(f'start python main.py\n')
            f.write(f'start "" "http://localhost:8765"\n')
        
        # Start Menu shortcut
        start_menu = Path(os.environ['APPDATA']) / "Microsoft/Windows/Start Menu/Programs"
        shortcut_path = start_menu / "SmartGuide AI.bat"
        
        with open(shortcut_path, 'w') as f:
            f.write(f'@echo off\n')
            f.write(f'cd "{self.install_path / "desktop-app"}"\n')
            f.write(f'start python main.py\n')
    
    def create_start_script(self):
        start_script = self.install_path / "Start SmartGuide AI.bat"
        with open(start_script, 'w') as f:
            f.write(f'@echo off\n')
            f.write(f'echo Starting SmartGuide AI...\n')
            f.write(f'cd "{self.install_path / "desktop-app"}"\n')
            f.write(f'python main.py\n')
            f.write(f'pause\n')
    
    def create_uninstaller(self):
        uninstaller = self.install_path / "Uninstall.bat"
        with open(uninstaller, 'w') as f:
            f.write(f'@echo off\n')
            f.write(f'echo Uninstalling SmartGuide AI...\n')
            f.write(f'pause\n')
            f.write(f'rmdir /s /q "{self.install_path}"\n')
            f.write(f'del "%USERPROFILE%\\Desktop\\SmartGuide AI.bat"\n')
            f.write(f'echo Uninstalled successfully!\n')
            f.write(f'pause\n')
    
    def update_status(self, text):
        self.status_label.config(text=text)
        self.root.update_idletasks()
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    installer = SmartGuideInstaller()
    installer.run()
