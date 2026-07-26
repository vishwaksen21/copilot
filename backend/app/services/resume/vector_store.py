from typing import Optional
import chromadb
from sentence_transformers import SentenceTransformer


class VectorStoreService:
    """Vector store service using ChromaDB and sentence-transformers."""

    def __init__(self, persist_directory: str = "./chroma_db"):
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path=persist_directory)

        # Initialize embedding model
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

    def get_or_create_collection(self, name: str):
        """Get or create a ChromaDB collection."""
        return self.client.get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_documents(
        self,
        collection_name: str,
        documents: list[str],
        metadatas: list[dict],
        ids: list[str]
    ):
        """Add documents to a collection."""
        collection = self.get_or_create_collection(collection_name)

        # Generate embeddings
        embeddings = self.embedding_model.encode(documents).tolist()

        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

    async def search(
        self,
        collection_name: str,
        query: str,
        n_results: int = 5,
        filter: Optional[dict] = None
    ) -> list[dict]:
        """Search for similar documents."""
        try:
            collection = self.get_or_create_collection(collection_name)

            # Generate query embedding
            query_embedding = self.embedding_model.encode([query]).tolist()

            # Search
            results = collection.query(
                query_embeddings=query_embedding,
                n_results=n_results,
                where=filter
            )

            # Format results
            formatted = []
            for i in range(len(results["ids"][0])):
                formatted.append({
                    "id": results["ids"][0][i],
                    "document": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else None
                })

            return formatted
        except Exception as e:
            print(f"Vector search error: {e}")
            return []

    def delete_documents(self, collection_name: str, ids: list[str]):
        """Delete documents from a collection."""
        collection = self.get_or_create_collection(collection_name)
        collection.delete(ids=ids)
