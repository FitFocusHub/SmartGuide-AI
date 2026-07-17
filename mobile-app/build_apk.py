# SmartGuide AI - APK Builder
# This script helps build APK using Buildozer (Kivy)

## Prerequisites:
## 1. Python 3.8+
## 2. Buildozer: pip install buildozer
## 3. Cython: pip install cython
## 4. Java JDK 8+
## 5. Android SDK

## Quick Start:
## 1. Run: pip install buildozer cython
## 2. Run: buildozer init (configure buildozer.spec)
## 3. Run: buildozer android debug
## 4. APK will be in bin/ folder

## For Windows Users:
## Use WSL (Windows Subsystem for Linux) for building APK
## Or use online APK builders like PhoneGap, Cordova

# ============================================
# Option 1: Using Buildozer (Recommended)
# ============================================

# Step 1: Install Buildozer
# pip install buildozer cython

# Step 2: Create buildozer.spec file
# buildozer init

# Step 3: Edit buildozer.spec
# [app]
# title = SmartGuide AI
# package.name = smartguide
# package.domain = com.smartguide
# source.dir = .
# source.include_exts = py,png,jpg,kv,atlas
# version = 1.1.0
# requirements = python3,kivy,websocket
# android.permissions = INTERNET
# android.api = 30
# android.minapi = 21
# android.arch = arm64-v8a

# Step 4: Build APK
# buildozer android debug

# ============================================
# Option 2: Using Online Builders
# ============================================

# PhoneGap: https://phonegap.com
# Cordova: https://cordova.apache.org
# PWABuilder: https://www.pwabuilder.com

# ============================================
# Option 3: PWA to APK Converter
# ============================================

# Use Trusted Web Activities (TWA) to convert PWA to APK
# https://github.com/nicholasgasior/generate-apk-from-pwa

# ============================================
# Simple PWA Instructions (No APK needed)
# ============================================

print("""
╔══════════════════════════════════════════════════╗
║     SmartGuide AI - Mobile Installation         ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  For Android/iOS - Use PWA (No APK needed):     ║
║                                                  ║
║  1. Open Chrome on your phone                   ║
║  2. Go to: your-github-pages-url                ║
║  3. Tap "Add to Home Screen"                    ║
║  4. Done! App icon on home screen               ║
║                                                  ║
║  Benefits:                                       ║
║  - No app store needed                          ║
║  - Always up to date                            ║
║  - Works on Android & iOS                       ║
║  - No installation required                     ║
║                                                  ║
╚══════════════════════════════════════════════════╝
""")
