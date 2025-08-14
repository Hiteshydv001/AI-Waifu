#!/usr/bin/env python3
"""
Quick test script to check ElevenLabs voices
"""

import os
from elevenlabs import ElevenLabs

# Get API key from environment variable
api_key = os.getenv('elven_lab_api_key', ')

if not api_key:
    print("❌ No API key found!")
    exit(1)

try:
    print(f"🔑 Using API key: {api_key[:8]}...")
    client = ElevenLabs(api_key=api_key)
    
    print("📝 Fetching available voices...")
    voices = client.voices.get_all()
    
    if not voices.voices:
        print("❌ No voices found in your account")
        print("This could mean:")
        print("1. Invalid API key")
        print("2. No voices in your account")
        print("3. API connectivity issues")
    else:
        print(f"✅ Found {len(voices.voices)} voices:")
        print("=" * 50)
        
        for voice in voices.voices:
            print(f"• {voice.name} (ID: {voice.voice_id})")
            if hasattr(voice, 'category'):
                print(f"  Category: {voice.category}")
            print()

except Exception as e:
    print(f"❌ Error: {e}")
    print(f"Error type: {type(e)}")
