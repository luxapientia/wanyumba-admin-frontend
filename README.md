# Admin Frontend - Wanyumba

Admin panel frontend for the Wanyumba platform.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Redux Toolkit** - State management
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
admin-frontend/
├── src/
│   ├── api/          # API services
│   ├── components/    # Reusable components
│   ├── contexts/     # React contexts
│   ├── pages/        # Page components
│   └── store/        # Redux store
├── public/           # Static assets
└── index.html        # HTML entry point
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:3001/api/v1
```

