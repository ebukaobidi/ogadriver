# AI Verification System - Backend API Documentation

## Overview
This document describes the backend API endpoints for the AI-powered guarantor verification and location-based driver certification system.

## Endpoints

### 1. Initiate AI Guarantor Call
**POST** `/api/admin/ai/guarantor-call`

Initiates an AI-powered phone call to the guarantor for verification.

**Request Body:**
```json
{
  "guarantor_id": 123,
  "driver_id": 456,
  "questions": [
    {
      "id": "relationship",
      "question": "Can you confirm your relationship with the driver...",
      "category": "relationship_verification",
      "weight": 0.25
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "call_id": "call_abc123",
  "location_data": {
    "address_match": true,
    "geo_verified": true,
    "residence_duration": "2 years",
    "risk_level": "low",
    "coordinates": {
      "lat": 6.5244,
      "lng": 3.3792
    }
  }
}
```

### 2. Analyze Guarantor Call
**POST** `/api/admin/ai/analyze-guarantor-call`

Analyzes the conversation transcript using AI to determine guarantor reliability.

**Request Body:**
```json
{
  "guarantor_id": 123,
  "driver_id": 456,
  "transcript": "Full conversation transcript...",
  "answers": {
    "relationship": "I have known him for 5 years...",
    "understanding": "Yes, I understand my obligations...",
    "financial": "I am aware of the liabilities...",
    "location": "He lives at 123 Main Street..."
  },
  "duration": 180
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "categories": [
      {
        "name": "Relationship Verification",
        "score": 85,
        "assessment": "Strong relationship evidence, long-term acquaintance confirmed"
      },
      {
        "name": "Guarantor Understanding",
        "score": 90,
        "assessment": "Clear understanding of obligations and responsibilities"
      },
      {
        "name": "Financial Awareness",
        "score": 75,
        "assessment": "Adequate understanding of financial liabilities"
      },
      {
        "name": "Location Verification",
        "score": 95,
        "assessment": "Address confirmed, residence duration verified"
      }
    ],
    "recommendations": [
      {
        "type": "approve",
        "title": "Approve Guarantor",
        "description": "Guarantor demonstrates strong reliability and understanding"
      }
    ]
  },
  "certification_score": 86
}
```

### 3. Location-Based Certification
**POST** `/api/admin/ai/location-certification`

Performs location-based certification analysis for drivers.

**Request Body:**
```json
{
  "driver_id": 456,
  "address": "123 Main Street, Lagos",
  "coordinates": {
    "lat": 6.5244,
    "lng": 3.3792
  }
}
```

**Response:**
```json
{
  "success": true,
  "certification": {
    "address_verified": true,
    "geo_match": true,
    "residence_stability": "high",
    "location_risk_score": 15,
    "service_area_coverage": 85,
    "certification_level": "gold",
    "recommendations": [
      "Driver is in optimal service area",
      "High residence stability indicates reliability"
    ]
  }
}
```

### 4. Driver Location Tracking
**GET** `/api/admin/drivers/{driver_id}/location-history`

Retrieves location history for a driver.

**Response:**
```json
{
  "success": true,
  "location_history": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "lat": 6.5244,
      "lng": 3.3792,
      "accuracy": 10,
      "activity": "active"
    }
  ],
  "patterns": {
    "home_location": { "lat": 6.5244, "lng": 3.3792 },
    "frequent_areas": [
      { "lat": 6.5300, "lng": 3.3800, "frequency": "high" }
    ]
  }
}
```

## AI Integration Requirements

### Speech Recognition (STT)
- Use Google Cloud Speech-to-Text or AWS Transcribe
- Real-time transcription during calls
- Support for multiple languages (English, Pidgin, local languages)

### Natural Language Processing (NLP)
- Sentiment analysis for guarantor responses
- Intent detection for understanding commitment level
- Entity extraction for key information (addresses, dates, relationships)

### Location Services
- Google Maps Geocoding API for address verification
- Reverse geocoding for coordinate-to-address mapping
- Distance calculation for service area coverage

### Voice Biometrics (Optional)
- Voice print verification for identity confirmation
- Detect potential fraud or impersonation

## Database Schema Updates

### guarantor_verifications table
```sql
CREATE TABLE guarantor_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guarantor_id INT,
  driver_id INT,
  call_id VARCHAR(100),
  transcript TEXT,
  answers JSON,
  duration INT,
  certification_score INT,
  analysis JSON,
  location_data JSON,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guarantor_id) REFERENCES guarantors(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
```

### driver_locations table
```sql
CREATE TABLE driver_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  driver_id INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accuracy INT,
  activity VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
```

### location_certifications table
```sql
CREATE TABLE location_certifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  driver_id INT,
  address_verified BOOLEAN,
  geo_match BOOLEAN,
  residence_stability VARCHAR(50),
  location_risk_score INT,
  service_area_coverage INT,
  certification_level VARCHAR(20),
  recommendations JSON,
  certified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
```

## Security Considerations

1. **Data Privacy**: Encrypt all voice recordings and transcripts
2. **Consent**: Obtain explicit consent before recording calls
3. **Access Control**: Restrict access to verification data to authorized admins only
4. **Audit Trail**: Log all verification activities for compliance
5. **Rate Limiting**: Implement rate limiting on AI API calls to prevent abuse

## Configuration

### Environment Variables
```env
AI_SERVICE_PROVIDER=google
GOOGLE_CLOUD_PROJECT_ID=your-project
GOOGLE_SPEECH_API_KEY=your-api-key
GOOGLE_MAPS_API_KEY=your-maps-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+234XXXXXXXXXX
```

## Implementation Notes

1. **Call Initiation**: Use Twilio or similar service for automated phone calls
2. **Real-time Processing**: Stream audio to STT service during call
3. **Fallback**: Have manual verification option if AI fails
4. **Retry Logic**: Implement retry mechanism for failed calls
5. **Quality Monitoring**: Track AI accuracy and adjust thresholds as needed
