# waifu_core/services/memory_service.py
import chromadb
from chromadb.utils import embedding_functions
from waifu_core.models import LLMProvider
import yaml
from pathlib import Path

# Load config here to avoid circular dependency with engine
SERVICE_CONFIG = yaml.safe_load(Path("config/services.yaml").read_text())

class MemoryService:
    def __init__(self):
        print("Initializing Long-Term Memory Service...")
        self.config = SERVICE_CONFIG['memory']
        self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        
        self.client = chromadb.PersistentClient(path=self.config['db_path'])
        
        self.collection = self.client.get_or_create_collection(
            name="yuki_memories",
            embedding_function=self.embedding_function
        )
        print("Long-Term Memory Service ready.")

    def add_memories(self, facts: list[str], user_id: str = "senpai"):
        if not facts:
            return

        memory_ids = [f"{user_id}_{hash(fact)}" for fact in facts]
        
        # Filter out memories that already exist
        existing_memories = self.collection.get(ids=memory_ids)['ids']
        new_facts = [fact for fact, mem_id in zip(facts, memory_ids) if mem_id not in existing_memories]
        new_memory_ids = [mem_id for mem_id in memory_ids if mem_id not in existing_memories]

        if not new_facts:
            return
            
        print(f"Adding {len(new_facts)} new memories: {new_facts}")
        self.collection.add(
            documents=new_facts,
            metadatas=[{"user": user_id}] * len(new_facts),
            ids=new_memory_ids
        )

    def retrieve_relevant_memories(self, query: str, user_id: str = "senpai") -> list[str]:
        if not query:
            return []
            
        results = self.collection.query(
            query_texts=[query],
            n_results=self.config['retrieval_results'],
            where={"user": user_id}
        )
        return results['documents'][0] if results and results['documents'] else []