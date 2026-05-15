from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from holography_engine import process_hologram
import uvicorn
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/simulate")
async def simulate(
    file: UploadFile = File(...),
    wavelength: float = Form(...),
    pixel_size: float = Form(...),
    distance: float = Form(...)
):
    try:
        contents = await file.read()
        results = process_hologram(contents, wavelength, pixel_size, distance)
        if not results.get("success", True):
            raise ValueError(results.get("error", "Unknown processing error"))
        return results
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
