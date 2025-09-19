from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from textblob import TextBlob
from langdetect import detect
import random
import base64
import io
from PIL import Image
import numpy as np

app = FastAPI(title="Coastal Resilience ML Service", version="1.0.0")

class AnalysisRequest(BaseModel):
    text: str
    hazardType: str
    severity: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class SocialMediaRequest(BaseModel):
    keywords: List[str]
    location: dict

class AnalysisResponse(BaseModel):
    sentiment: str
    confidence: float
    keywords: List[str]
    fakeDetection: dict
    imageAnalysis: Optional[dict] = None
    riskScore: float
    isVerified: bool

@app.get("/")
async def root():
    return {"message": "Coastal Resilience ML Service is running"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_report(request: AnalysisRequest):
    try:
        # Sentiment Analysis
        blob = TextBlob(request.text)
        sentiment_polarity = blob.sentiment.polarity
        
        if sentiment_polarity > 0.1:
            sentiment = "positive"
        elif sentiment_polarity < -0.1:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        confidence = abs(sentiment_polarity)
        
        # Extract keywords
        keywords = [word.lower() for word in blob.noun_phrases][:5]
        
        # Enhanced fake detection
        fake_indicators = ['fake', 'hoax', 'rumor', 'unconfirmed', 'false', 'misleading']
        text_lower = request.text.lower()
        
        has_fake_indicators = any(indicator in text_lower for indicator in fake_indicators)
        
        # Severity and hazard type weights
        severity_weight = {
            'low': 0.1,
            'medium': 0.3,
            'high': 0.6,
            'critical': 0.8
        }
        
        hazard_credibility = {
            'flood': 0.9,
            'cyclone': 0.8,
            'tsunami': 0.7,
            'storm_surge': 0.8,
            'other': 0.6
        }
        
        base_fake_score = 0.3 if has_fake_indicators else 0.1
        severity_factor = severity_weight.get(request.severity, 0.3)
        hazard_factor = hazard_credibility.get(request.hazardType, 0.6)
        
        # Calculate risk score
        risk_score = min(severity_factor + (0.2 if request.latitude and request.longitude else 0), 1.0)
        
        fake_probability = min(base_fake_score - (hazard_factor * 0.2), 0.8)
        is_fake = fake_probability > 0.4
        is_verified = not is_fake and risk_score > 0.3
        
        return AnalysisResponse(
            sentiment=sentiment,
            confidence=confidence,
            keywords=keywords,
            fakeDetection={
                "isFake": is_fake,
                "confidence": fake_probability,
                "reasons": ["Text analysis", "Keyword detection"] if has_fake_indicators else []
            },
            riskScore=risk_score,
            isVerified=is_verified
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/social-media")
async def analyze_social_media(request: SocialMediaRequest):
    try:
        # Placeholder for social media analysis
        # In production, this would integrate with Twitter API, etc.
        
        mock_posts = [
            {
                "text": f"Heavy rains and flooding reported near {request.location}",
                "sentiment": "negative",
                "confidence": 0.8,
                "source": "twitter",
                "timestamp": "2024-01-15T10:30:00Z"
            },
            {
                "text": f"Storm surge warning for coastal areas around {request.location}",
                "sentiment": "negative", 
                "confidence": 0.9,
                "source": "facebook",
                "timestamp": "2024-01-15T11:15:00Z"
            }
        ]
        
        return {
            "posts": mock_posts,
            "summary": {
                "total_posts": len(mock_posts),
                "negative_sentiment": 2,
                "positive_sentiment": 0,
                "neutral_sentiment": 0,
                "average_confidence": 0.85
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social media analysis failed: {str(e)}")

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to numpy array for analysis
        img_array = np.array(image)
        
        # Simple image analysis (placeholder for real ML models)
        # In production, this would use trained models for:
        # - Disaster scene detection
        # - Deepfake detection
        # - Image authenticity verification
        
        # Basic image properties
        height, width = img_array.shape[:2]
        total_pixels = height * width
        
        # Simple "authenticity" check based on image properties
        authenticity_score = min(0.9, (total_pixels / 1000000) * 0.5 + 0.4)
        
        # Mock disaster detection
        disaster_keywords = ['water', 'flood', 'damage', 'debris', 'storm']
        disaster_confidence = random.uniform(0.6, 0.9)
        
        is_authentic = authenticity_score > 0.5
        contains_disaster_scene = disaster_confidence > 0.7
        
        return {
            "isAuthentic": is_authentic,
            "authenticityScore": authenticity_score,
            "containsDisasterScene": contains_disaster_scene,
            "disasterConfidence": disaster_confidence,
            "imageProperties": {
                "width": width,
                "height": height,
                "format": image.format,
                "mode": image.mode
            },
            "analysis": {
                "qualityScore": min(1.0, (width * height) / 2000000),
                "suspiciousElements": [] if is_authentic else ["Low resolution", "Compression artifacts"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)