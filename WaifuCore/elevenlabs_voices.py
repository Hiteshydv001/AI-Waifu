#!/usr/bin/env python3
"""
ElevenLabs Voice Discovery Script

This script helps you discover available voices in your ElevenLabs account
and test voice synthesis.

Usage:
1. Set your ELEVENLABS_API_KEY environment variable
2. Run: python elevenlabs_voices.py
"""

import os
import asyncio
from typing import List, Dict

try:
    from elevenlabs import ElevenLabs, Voice
    ELEVENLABS_AVAILABLE = True
except ImportError:
    print("ElevenLabs library not found. Install with: pip install elevenlabs")
    exit(1)

def list_voices() -> List[Dict]:
    """List all available voices in your ElevenLabs account"""
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        print("❌ ELEVENLABS_API_KEY environment variable not set!")
        print("   Set it with: export ELEVENLABS_API_KEY=your_api_key_here")
        return []
    
    try:
        client = ElevenLabs(api_key=api_key)
        voices = client.voices.get_all()
        
        print("🎤 Available ElevenLabs Voices:")
        print("=" * 50)
        
        voice_list = []
        for voice in voices.voices:
            voice_info = {
                'voice_id': voice.voice_id,
                'name': voice.name,
                'category': voice.category,
                'description': getattr(voice, 'description', 'No description'),
                'preview_url': getattr(voice, 'preview_url', None)
            }
            voice_list.append(voice_info)
            
            print(f"Name: {voice.name}")
            print(f"ID: {voice.voice_id}")
            print(f"Category: {voice.category}")
            if hasattr(voice, 'description') and voice.description:
                print(f"Description: {voice.description}")
            print("-" * 30)
        
        return voice_list
        
    except Exception as e:
        print(f"❌ Error fetching voices: {e}")
        return []

def test_voice_synthesis(voice_id: str, text: str = "Hello! This is a test of my voice."):
    """Test voice synthesis with a specific voice"""
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        print("❌ ELEVENLABS_API_KEY environment variable not set!")
        return False
    
    try:
        client = ElevenLabs(api_key=api_key)
        
        print(f"🎵 Testing voice synthesis with voice ID: {voice_id}")
        print(f"Text: '{text}'")
        
        # Generate audio
        audio_generator = client.generate(
            text=text,
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        # Save to file
        audio_bytes = b''.join(audio_generator)
        filename = f"test_voice_{voice_id[:8]}.mp3"
        
        with open(filename, 'wb') as f:
            f.write(audio_bytes)
        
        print(f"✅ Audio saved to: {filename}")
        print(f"   File size: {len(audio_bytes)} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing voice synthesis: {e}")
        return False

def main():
    """Main function"""
    print("🔊 ElevenLabs Voice Discovery & Testing Tool")
    print("=" * 60)
    
    # List all voices
    voices = list_voices()
    
    if not voices:
        print("No voices found or API key issues.")
        return
    
    print(f"\n✅ Found {len(voices)} voices in your account.")
    
    # Interactive voice testing
    while True:
        print("\nOptions:")
        print("1. Test a voice by name")
        print("2. Test a voice by ID") 
        print("3. List voices again")
        print("4. Exit")
        
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == "1":
            name = input("Enter voice name: ").strip()
            # Find voice by name
            voice = next((v for v in voices if v['name'].lower() == name.lower()), None)
            if voice:
                text = input(f"Enter text to synthesize (or press Enter for default): ").strip()
                if not text:
                    text = "Hello! This is a test of my voice."
                test_voice_synthesis(voice['voice_id'], text)
            else:
                print(f"❌ Voice '{name}' not found!")
                
        elif choice == "2":
            voice_id = input("Enter voice ID: ").strip()
            text = input("Enter text to synthesize (or press Enter for default): ").strip()
            if not text:
                text = "Hello! This is a test of my voice."
            test_voice_synthesis(voice_id, text)
            
        elif choice == "3":
            list_voices()
            
        elif choice == "4":
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please enter 1-4.")

if __name__ == "__main__":
    main()
