# download_tts_model.py
from TTS.utils.manage import ModelManager

# This is the same model name from the command line
model_name = "tts_models/multilingual/multi-dataset/xtts_v2"

print(f"Downloading model: {model_name}")

# The ModelManager will download the model and all its files to the default cache location
mm = ModelManager()

# This command downloads the model and returns the path to its directory
model_path = mm.download_model(model_name)

print("\n--- Download Complete! ---")
print(f"Model files are located at: {model_path}")
print("You can now use this path to start the server.")