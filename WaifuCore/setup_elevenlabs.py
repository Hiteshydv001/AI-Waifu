#!/usr/bin/env python3
"""
ElevenLabs Setup Script for WaifuCore

This script helps you set up ElevenLabs TTS integration.
"""

import os
import sys
from pathlib import Path

def check_api_key():
    """Check if ElevenLabs API key is configured"""
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if api_key:
        print(f"✅ ElevenLabs API key found: {api_key[:8]}...")
        return True
    else:
        print("❌ ElevenLabs API key not found!")
        print("\n📝 To set up your API key:")
        print("1. Get your API key from: https://elevenlabs.io/")
        print("2. Set environment variable: export ELEVENLABS_API_KEY=your_key_here")
        print("3. Or add it to your .env file in WaifuCore/")
        return False

def install_elevenlabs():
    """Install ElevenLabs package"""
    try:
        import elevenlabs
        print("✅ ElevenLabs package already installed")
        return True
    except ImportError:
        print("📦 Installing ElevenLabs package...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "elevenlabs"])
            print("✅ ElevenLabs package installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install ElevenLabs package")
            return False

def update_services_config():
    """Update services.yaml to use ElevenLabs"""
    config_path = Path("config/services.yaml")
    if not config_path.exists():
        print(f"❌ Config file not found: {config_path}")
        return False
    
    try:
        with open(config_path, 'r') as f:
            content = f.read()
        
        # Check if already configured
        if 'provider: "elevenlabs"' in content:
            print("✅ Services config already set to use ElevenLabs")
            return True
        
        # Update provider
        if 'provider: "kokoro"' in content:
            content = content.replace('provider: "kokoro"', 'provider: "elevenlabs"')
            
            with open(config_path, 'w') as f:
                f.write(content)
            
            print("✅ Updated services.yaml to use ElevenLabs provider")
            return True
        else:
            print("⚠️  Could not automatically update provider. Please manually set:")
            print("   tts.provider: 'elevenlabs' in config/services.yaml")
            return False
            
    except Exception as e:
        print(f"❌ Error updating config: {e}")
        return False

def main():
    """Main setup function"""
    print("🔊 ElevenLabs TTS Setup for WaifuCore")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("config/services.yaml").exists():
        print("❌ Please run this script from the WaifuCore directory")
        sys.exit(1)
    
    success_count = 0
    
    # Step 1: Install package
    if install_elevenlabs():
        success_count += 1
    
    # Step 2: Check API key
    if check_api_key():
        success_count += 1
    
    # Step 3: Update config
    if update_services_config():
        success_count += 1
    
    print("\n" + "=" * 40)
    print(f"Setup complete: {success_count}/3 steps successful")
    
    if success_count == 3:
        print("🎉 ElevenLabs TTS is ready to use!")
        print("\n📝 Next steps:")
        print("1. Run 'python elevenlabs_voices.py' to explore available voices")
        print("2. Update voice_id in config/services.yaml")
        print("3. Start your application: python -m main_api")
    else:
        print("⚠️  Some setup steps failed. Please check the errors above.")

if __name__ == "__main__":
    main()
