"""
SmartGuide AI - Desktop Installer
Build: PyInstaller --onefile --noconsole install.py
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path
import tkinter as tk
from tkinter import messagebox
import threading

class Installer:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("SmartGuide AI")
        self.root.geometry("450x350")
        self.root.resizable(False, False)
        self.root.configure(bg="#1a1a2e")
        
        self.install_dir = Path(os.environ['APPDATA']) / "SmartGuideAI"
        self.source_dir = Path(__file__).parent.parent
        
        self.setup_ui()
        
    def setup_ui(self):
        # Header
        tk.Label(self.root, text="🤖 SmartGuide AI", font=("Segoe UI", 22, "bold"),
                bg="#1a1a2e", fg="#e94560").pack(pady=(25, 5))
        
        tk.Label(self.root, text="Real-time AI Guidance for Any Software", 
                font=("Segoe UI", 10), bg="#1a1a2e", fg="#888").pack()
        
        # Progress
        self.progress_frame = tk.Frame(self.root, bg="#2a2a4a", height=8)
        self.progress_frame.pack(fill=tk.X, padx=40, pady=(30, 5))
        self.progress_frame.pack_propagate(False)
        
        self.progress_bar = tk.Frame(self.progress_frame, bg="#e94560", height=8, width=0)
        self.progress_bar.pack(side=tk.LEFT)
        
        self.status = tk.Label(self.root, text="Ready to install", font=("Segoe UI", 9),
                              bg="#1a1a2e", fg="#aaa")
        self.status.pack(pady=(5, 0))
        
        # Features
        features_frame = tk.Frame(self.root, bg="#1a1a2e")
        features_frame.pack(pady=15)
        
        features = ["✅ 50+ Desktop Apps Support", "✅ YouTube Control", "✅ Browser Automation"]
        for f in features:
            tk.Label(features_frame, text=f, font=("Segoe UI", 9), 
                    bg="#1a1a2e", fg="#00ff88").pack(anchor=tk.W, pady=2)
        
        # Buttons
        btn_frame = tk.Frame(self.root, bg="#1a1a2e")
        btn_frame.pack(fill=tk.X, padx=40, pady=(15, 20))
        
        self.install_btn = tk.Button(btn_frame, text="Install", font=("Segoe UI", 12, "bold"),
                                    bg="#e94560", fg="white", relief=tk.FLAT, padx=40, pady=8,
                                    cursor="hand2", command=self.start_install)
        self.install_btn.pack(side=tk.RIGHT)
        
        tk.Button(btn_frame, text="Cancel", font=("Segoe UI", 10),
                 bg="#444", fg="white", relief=tk.FLAT, padx=15, pady=8,
                 cursor="hand2", command=self.root.destroy).pack(side=tk.RIGHT, padx=(0,10))
        
    def start_install(self):
        self.install_btn.config(state=tk.DISABLED)
        threading.Thread(target=self.install, daemon=True).start()
        
    def update(self, text, progress):
        self.status.config(text=text)
        self.progress_bar.config(width=int(progress * 4.1))
        self.root.update_idletasks()
        
    def install(self):
        try:
            self.update("Creating folder...", 10)
            self.install_dir.mkdir(parents=True, exist_ok=True)
            
            self.update("Copying files...", 30)
            if (self.source_dir / "desktop-app").exists():
                shutil.copytree(self.source_dir / "desktop-app", 
                              self.install_dir / "desktop-app", dirs_exist_ok=True)
            
            if (self.source_dir / "browser-extension").exists():
                shutil.copytree(self.source_dir / "browser-extension",
                              self.install_dir / "browser-extension", dirs_exist_ok=True)
            
            self.update("Creating launcher...", 60)
            self.create_launcher()
            
            self.update("Creating uninstaller...", 80)
            self.create_uninstaller()
            
            self.update("Done!", 100)
            
            messagebox.showinfo("Success", 
                "SmartGuide AI installed!\n\n"
                "Find 'SmartGuide AI' in Start Menu\n"
                "or run from:\n" + str(self.install_dir))
            self.root.destroy()
            
        except Exception as e:
            messagebox.showerror("Error", str(e))
            self.root.destroy()
            
    def create_launcher(self):
        # Start Menu shortcut
        start_menu = Path(os.environ['APPDATA']) / "Microsoft/Windows/Start Menu/Programs/SmartGuideAI"
        start_menu.mkdir(parents=True, exist_ok=True)
        
        bat = start_menu / "SmartGuide AI.bat"
        bat.write_text(f'@echo off\ncd "{self.install_dir / "desktop-app"}"\npython main.py\n')
        
        # Uninstall entry
        uninstall_bat = start_menu / "Uninstall.bat"
        uninstall_bat.write_text(f'@echo off\nrmdir /s /q "{self.install_dir}"\ndel "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\SmartGuideAI\\*.bat"\nrmdir "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\SmartGuideAI"\n')
        
    def create_uninstaller(self):
        uninstall = self.install_dir / "Uninstall.bat"
        uninstall.write_text(f'@echo off\nrmdir /s /q "{self.install_dir}"\ndel "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\SmartGuideAI\\*.bat"\nrmdir "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\SmartGuideAI" 2>nul\necho Uninstalled!\npause\n')
        
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    Installer().run()
