#!/usr/bin/env python3
"""
Gemini AI Setup Script for WaifuCore

This script helps you set up Gemini AI integration as the LLM provider.
"""

import os
import sys
from pathlib import Path

def check_api_key():
    """Check if Gemini API key is configured"""
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        print(f"✅ Gemini API key found: {api_key[:8]}...")
        return True
    else:
        print("❌ Gemini API key not found!")
        print("\n📝 To set up your API key:")
        print("1. Get your API key from: https://makersuite.google.com/app/apikey")
        print("2. Set environment variable: export GEMINI_API_KEY=your_key_here")
        print("3. Or add it to your .env file in WaifuCore/")
        return False

def install_gemini():
    """Install Google Generative AI package"""
    try:
        import google.generativeai as genai
        print("✅ Google Generative AI package already installed")
        return True
    except ImportError:
        print("📦 Installing Google Generative AI package...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai"])
            print("✅ Google Generative AI package installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install Google Generative AI package")
            return False

def update_services_config():
    """Update services.yaml to use Gemini"""
    config_path = Path("config/services.yaml")
    if not config_path.exists():
        print(f"❌ Config file not found: {config_path}")
        return False
    
    try:
        with open(config_path, 'r') as f:
            content = f.read()
        
        # Check if already configured for Gemini
        if 'gemini_api_key:' in content and 'gemini: "gemini-1.5-flash"' in content:
            print("✅ Services config already set to use Gemini")
            return True
        
        print("✅ Services config updated for Gemini in previous setup")
        return True
            
    except Exception as e:
        print(f"❌ Error checking config: {e}")
        return False

def test_gemini_connection():
    """Test connection to Gemini API"""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ Cannot test connection - API key not found")
        return False
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        print("🧪 Testing Gemini API connection...")
        response = model.generate_content("Hello! Please respond with 'Connection successful!'")
        
        if response.text:
            print(f"✅ Gemini API test successful!")
            print(f"   Response: {response.text[:100]}...")
            return True
        else:
            print("❌ Gemini API test failed - no response")
            return False
            
    except Exception as e:
        print(f"❌ Gemini API test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🤖 Gemini AI Setup for WaifuCore")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("config/services.yaml").exists():
        print("❌ Please run this script from the WaifuCore directory")
        sys.exit(1)
    
    success_count = 0
    
    # Step 1: Install package
    if install_gemini():
        success_count += 1
    
    # Step 2: Check API key
    if check_api_key():
        success_count += 1
    
    # Step 3: Check config
    if update_services_config():
        success_count += 1
    
    # Step 4: Test connection (if API key is available)
    if os.getenv('GEMINI_API_KEY'):
        if test_gemini_connection():
            success_count += 1
    else:
        print("⚠️  Skipping connection test - API key not configured")
    
    print("\n" + "=" * 40)
    max_steps = 4 if os.getenv('GEMINI_API_KEY') else 3
    print(f"Setup complete: {success_count}/{max_steps} steps successful")
    
    if success_count >= 3:
        print("🎉 Gemini AI is ready to use!")
        print("\n📝 Next steps:")
        print("1. Make sure GEMINI_API_KEY is set in your environment")
        print("2. Start your application: python -m main_api")
        print("3. The WebSocket will default to using Gemini AI")
        print("\n💡 Available models:")
        print("   - gemini-1.5-flash (fast, free tier)")
        print("   - gemini-1.5-pro (advanced, higher quality)")
    else:
        print("⚠️  Some setup steps failed. Please check the errors above.")

if __name__ == "__main__":
    main()
