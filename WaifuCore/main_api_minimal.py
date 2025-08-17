from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="WaifuCore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    welcome_message = {
        "message": "Welcome to WaifuCore API! 🎉",
        "status": "healthy",
        "version": "1.0.0",
        "description": "An AI-powered waifu chat companion with voice synthesis",
        "documentation": "/docs",
        "healthcheck": "/health"
    }
    return welcome_message

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "waifucore-api-minimal"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
