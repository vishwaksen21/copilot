from typing import List, Dict, Optional
from ..resume.vector_store import VectorStoreService


class ConversationMemory:
    """Manages conversation context with RAG-augmented responses."""

    def __init__(self, vector_store: VectorStoreService):
        self.vector_store = vector_store
        self.max_context_tokens = 8000
        self.recent_window = 20

    async def build_context(
        self,
        conversation_id: str,
        user_message: str,
        resume_id: Optional[str] = None,
        jd_id: Optional[str] = None,
    ) -> List[Dict]:
        """Build context window with recent messages + RAG-relevant context."""
        context = []

        # Retrieve relevant resume context
        if resume_id:
            resume_chunks = await self.vector_store.search(
                collection_name="resume_embeddings",
                query=user_message,
                n_results=3,
                filter={"resume_id": resume_id}
            )
            if resume_chunks:
                context.append({
                    "role": "system",
                    "content": f"Relevant resume context:\n{self._format_chunks(resume_chunks)}"
                })

        # Retrieve relevant JD context
        if jd_id:
            jd_chunks = await self.vector_store.search(
                collection_name="jd_embeddings",
                query=user_message,
                n_results=2,
                filter={"jd_id": jd_id}
            )
            if jd_chunks:
                context.append({
                    "role": "system",
                    "content": f"Relevant job description context:\n{self._format_chunks(jd_chunks)}"
                })

        # Retrieve relevant past conversations
        past_chunks = await self.vector_store.search(
            collection_name="conversation_embeddings",
            query=user_message,
            n_results=3
        )
        if past_chunks:
            context.append({
                "role": "system",
                "content": f"Relevant past discussion:\n{self._format_chunks(past_chunks)}"
            })

        # Add recent conversation messages
        recent_messages = await self._get_recent_messages(
            conversation_id, limit=self.recent_window
        )
        context.extend(recent_messages)

        return context

    def _format_chunks(self, chunks: List[Dict]) -> str:
        formatted = []
        for chunk in chunks:
            source = chunk.get("metadata", {}).get("source", "unknown")
            document = chunk.get("document", "")
            formatted.append(f"[Source: {source}]\n{document}")
        return "\n\n---\n\n".join(formatted)

    async def _get_recent_messages(
        self, conversation_id: str, limit: int
    ) -> List[Dict]:
        """Get recent messages from conversation."""
        # TODO: Implement with database
        return []
