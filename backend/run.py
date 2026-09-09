import uvicorn

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  SAVIAN — Railway Arbitration Backend Starting")
    print("  Corridor: BINA - ITARSI (152.4 km)")
    print("  Swagger Docs: http://localhost:8000/docs")
    print("  API Base:     http://localhost:8000/api")
    print("=" * 60 + "\n")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
