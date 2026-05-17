# EventSpark

EventSpark is an event management platform for building branded registration pages, tracking attendees, reviewing analytics, and improving event copy with AI assistance.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- OpenAI-compatible chat completions for event description enhancement

## Getting Started

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Run lint and tests:

```sh
npm run lint
npm test
```

## Environment

The web app expects these public Supabase variables:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

The `enhance-description` Supabase Edge Function expects server-side variables:

```sh
SUPABASE_URL=
SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

`OPENAI_MODEL` and `OPENAI_BASE_URL` are optional. Set them only when you need a different model or an OpenAI-compatible endpoint.

## Deployment

Deploy the frontend to any static web host that supports Vite output from `npm run build`. Deploy the Supabase migrations and Edge Function with the Supabase CLI, then configure the environment variables in your hosting and Supabase project settings.
