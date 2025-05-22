# Medical Chatbot Full-Stack Application

A full-stack medical chatbot application that uses sentence transformers to find the most relevant answers to medical questions.

## Features

- React/Next.js frontend with dark/light theme support
- FastAPI backend with sentence transformer model
- Docker setup for easy deployment
- Responsive design
- Real-time chat interface

## Project Structure

\`\`\`
medical-chatbot/
├── app/                  # Next.js frontend
├── backend/              # FastAPI backend
│   ├── app.py            # Main FastAPI application
│   ├── Dockerfile        # Backend Docker configuration
│   ├── requirements.txt  # Python dependencies
│   └── paumedquad.csv    # Dataset (you need to provide this)
├── components/           # React components
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile.frontend   # Frontend Docker configuration
└── README.md             # Project documentation
\`\`\`

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Docker and Docker Compose (for containerized deployment)
- The `paumedquad.csv` dataset file

### Local Development

1. **Set up the backend:**

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Place your paumedquad.csv file in this directory
uvicorn app:app --reload
\`\`\`

2. **Set up the frontend:**

\`\`\`bash
npm install
npm run dev
\`\`\`

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Deployment with Docker

1. **Build and start the containers:**

\`\`\`bash
docker-compose up -d
\`\`\`

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Customization

- **Dataset**: Replace `paumedquad.csv` with your own dataset, ensuring it has `question` and `answer` columns.
- **Model**: Change the sentence transformer model in `backend/app.py` to use a different model.
- **Styling**: Modify the Tailwind CSS classes in the frontend components to change the appearance.

## Performance Optimizations

The backend has been optimized for performance:

- Loads the model and dataset only once at startup
- Uses numpy for faster similarity calculations
- Provides response time metrics
- Implements proper error handling

## License

[MIT License](LICENSE)
