I want to build an email reply agent for gmail

use gmail PAI to fetch everything from primary inbox

agent should craft the email using opeanai or gemini API key

There should be a supabase database where the knowledge is stored

if you feel like its necessary, refer to that when crafting a reply

I need the ability to modify the email drafted by AI before sending

In supabase, the original AI email draft and the one I sent should be stored

Use vercel for frontend

If backend is neede. use Railway

Never send an email automatically. The user should be able to approve with one click

Implement authentication so only thre owner of the email has access. Login can be via google login

Every reply needs a star rating feedback and textual feedback that should be store in supabase

knowledge base should be converted to vector database and store in supabase. You will have to perform RAG to fetch relevant information from the vector database


Implementation should be in phases: Plan first, ask clarifying questions if needed, get my preferences, then execute in phases

