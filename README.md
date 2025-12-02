# Group Consensus

A multi-modal group decision-making platform with Yelp AI integration. Simplify group decisions with Tinder-like voting and real-time consensus tracking.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.5-green)
![Python](https://img.shields.io/badge/Python-3.8+-green)

## Features

- 🎯 **Tinder-like Voting Interface** - Swipe through options with intuitive gestures
- 🤖 **Yelp AI Integration** - Natural language search for real businesses
- 🎤 **Voice Processing (Gemini AI)** - Speak your preferences and get intelligent search
- 📸 **Image Analysis (Gemini AI)** - Upload food photos to find similar restaurants
- 📍 **Location-aware** - Get results near you automatically
- 💬 **Multi-modal Input** - Combine text, voice, and images
- 📊 **Real-time Consensus** - See votes update live
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- Yelp API Key ([Get one here](https://www.yelp.com/developers))
- Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd YELP
   ```

2. **Get Your API Keys**

   **Yelp API Key**:
   - Go to https://www.yelp.com/developers
   - Create an app
   - Copy your API Key

   **Gemini API Key**:
   - Go to https://aistudio.google.com/apikey
   - Sign in with Google
   - Click "Create API Key"
   - Copy your API Key

3. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv

   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate

   pip install -r requirements.txt

   # Create .env and add your API keys
   cp .env.example .env
   # Edit .env and set:
   # YELP_API_KEY=your_yelp_key
   # GEMINI_API_KEY=your_gemini_key
   ```

4. **Setup Frontend**
   ```bash
   cd ..  # Back to project root
   npm install
   cp .env.example .env
   ```

5. **Start Development Servers**

   **Option A: Automatic (Windows)**
   ```powershell
   .\start-dev.ps1
   ```

   **Option A: Automatic (Mac/Linux)**
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

   **Option B: Manual**

   Terminal 1 (Backend):
   ```bash
   cd backend
   python main.py
   ```

   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   - Frontend: http://localhost:5173
   - Backend API: http://127.0.0.1:8000
   - API Docs: http://127.0.0.1:8000/docs

## Project Structure

```
YELP/
├── src/                      # Frontend React application
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   │   └── yelpAi.ts      # Yelp AI integration
│   └── lib/                # Utility functions
├── backend/                 # FastAPI backend
│   ├── main.py            # FastAPI app and routes
│   ├── yelp_service.py    # Yelp AI API client
│   ├── models.py          # Pydantic models
│   ├── config.py          # Configuration
│   └── requirements.txt   # Python dependencies
├── INTEGRATION_GUIDE.md    # Detailed integration guide
└── README.md              # This file
```

## Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type safety
- **Vite 5.4.1** - Build tool
- **Tailwind CSS 3.4.10** - Styling
- **React Router 6.26.0** - Routing
- **Lucide React** - Icons

### Backend
- **FastAPI 0.115.5** - Web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **HTTPX** - HTTP client
- **Python-dotenv** - Environment management

### External APIs
- **Yelp AI Chat API v2** - Business search and chat

## Usage

### Creating a Poll

1. Go to Dashboard
2. Click "Create New Poll"
3. Select poll type (Restaurant, Trip, Activity, Service)
4. Enter details (title, location, preferences)
5. Invite participants
6. Share the poll link

### Voting

1. Open the poll link
2. Swipe right ❤️ to like
3. Swipe left ❌ to pass
4. Use search to find specific options
5. View results when voting closes

### Search Features

**Natural Language Queries:**
- "Find me a vegan pizza place"
- "Cheap tacos near me"
- "Best Italian restaurant for a date"
- "Coffee shops with WiFi"

**Multi-modal Input:**
- Text search
- Voice search (simulated)
- Image search (simulated)

## API Reference

### Frontend API

**Search Businesses**
```typescript
import { yelpAiService } from '@/services/yelpAi'

const businesses = await yelpAiService.search(
  "italian restaurants",
  37.7749,  // latitude
  -122.4194 // longitude
)
```

**Chat with Yelp AI**
```typescript
const response = await yelpAiService.chat(
  "What's a good date night restaurant?",
  { latitude: 37.7749, longitude: -122.4194, locale: "en_US" }
)

// Follow-up question
const followUp = await yelpAiService.chat(
  "Which one has outdoor seating?",
  { latitude: 37.7749, longitude: -122.4194, locale: "en_US" },
  response.chat_id  // Continue conversation
)
```

**Get User Location**
```typescript
const location = await yelpAiService.getUserLocation()
```

**Process Voice Input (Gemini)**
```typescript
const audioResult = await yelpAiService.processAudio(audioFile)
console.log(audioResult.result.transcription)  // "I want vegan pizza"
console.log(audioResult.result.search_query)   // "vegan pizza near me"
```

**Process Image (Gemini)**
```typescript
const imageResult = await yelpAiService.processImage(imageFile)
console.log(imageResult.result.food_items)    // ["pasta", "tomato sauce"]
console.log(imageResult.result.cuisine_type)  // "Italian"
```

**Multimodal Search (Combined)**
```typescript
const result = await yelpAiService.multimodalSearch({
  textQuery: "something like this but cheaper",
  audioFile: recordedAudio,
  imageFile: uploadedImage,
  latitude: 37.7749,
  longitude: -122.4194
})
// Returns analysis + businesses in one call!
```

### Backend API

See full API documentation at http://127.0.0.1:8000/docs

**POST /api/yelp/search**
```json
{
  "query": "italian restaurants",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "locale": "en_US"
}
```

**POST /api/yelp/chat**
```json
{
  "query": "Find me a good pizza place",
  "user_context": {
    "locale": "en_US",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "chat_id": "optional-conversation-id"
}
```

## Configuration

### Frontend (.env)

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Backend (backend/.env)

```env
YELP_API_KEY=your_yelp_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
HOST=127.0.0.1
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Development

### Running Tests

```bash
# Frontend
npm test

# Backend
cd backend
pytest
```

### Building for Production

```bash
# Frontend
npm run build

# Backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Code Style

```bash
# Frontend linting
npm run lint

# Backend formatting
cd backend
black .
```

## Troubleshooting

### Backend won't start
- Check if `backend/.env` exists and has valid `YELP_API_KEY`
- Ensure port 8000 is not in use
- Check Python version: `python --version` (need 3.8+)

### Frontend can't connect to backend
- Ensure backend is running: http://127.0.0.1:8000/health
- Check `VITE_API_URL` in `.env`
- Restart frontend after changing `.env`

### No search results
- Verify Yelp API key is valid
- Check backend logs for errors
- Try more specific queries with location

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed troubleshooting.

## Documentation

- [Integration Guide](./INTEGRATION_GUIDE.md) - Yelp AI setup and integration
- [Gemini Integration Guide](./GEMINI_INTEGRATION.md) - Voice and image processing setup
- [Backend README](./backend/README.md) - Backend-specific documentation
- [API Documentation](http://127.0.0.1:8000/docs) - Interactive API docs (when running)

## Roadmap

- [x] Yelp AI natural language search
- [x] Voice processing with Gemini
- [x] Image analysis with Gemini
- [x] Multimodal search combining inputs
- [ ] Real-time audio transcription UI
- [ ] Image preview with detected items
- [ ] Multi-turn chat UI
- [ ] Advanced filters (price, distance, rating)
- [ ] Map view for results
- [ ] User authentication
- [ ] Save favorite businesses
- [ ] Email notifications
- [ ] Mobile app
- [ ] Analytics dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project was created for the YELP Hackathon.

## Acknowledgments

- [Yelp API](https://www.yelp.com/developers) - Business data and AI chat
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Support

For issues and questions:
1. Check the [Integration Guide](./INTEGRATION_GUIDE.md)
2. Review [API Documentation](http://127.0.0.1:8000/docs)
3. Open an issue on GitHub

---

Made with ❤️ for the YELP Hackathon
