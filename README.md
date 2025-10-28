# Pierre de Maricourt — AI Tutor (Next.js)

Minimal Next.js app (text-only chat) to deploy to Vercel (free). This project uses a serverless API that includes the knowledge base file `public/knowledge/pierre_sources.txt` in the prompt.

## Quick deploy (recommended: Vercel)
1. Create a GitHub repo and push this project.
2. On Vercel, import the GitHub repo.
3. In Project Settings -> Environment Variables, add:
   - `OPENAI_API_KEY` = your OpenAI-compatible API key
4. Deploy. Vercel will give you a free `https://<project>.vercel.app` URL.

## Notes
- The `pierre_sources.txt` file already contains the three sources you provided (citations + short summaries).
- Keep your API key secret. Each chat request will call the LLM and may incur costs.
