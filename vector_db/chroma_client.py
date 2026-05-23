import chromadb
import structlog
from backend.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

class ChromaClientSingleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            try:
                logger.info("Initializing persistent ChromaDB client", persist_dir=settings.CHROMA_PERSIST_DIR)
                cls._instance = super(ChromaClientSingleton, cls).__new__(cls)
                cls._instance.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
                cls._instance._available = True
            except Exception as e:
                logger.error("ChromaDB client initialization failed", error=str(e))
                cls._instance = super(ChromaClientSingleton, cls).__new__(cls)
                cls._instance.client = None
                cls._instance._available = False
        return cls._instance

    def get_client(self) -> chromadb.PersistentClient:
        return self.client

    def get_collection(self, name: str):
        """
        Gets or creates a collection in ChromaDB.
        Returns None if ChromaDB is not available.
        """
        if not self._available or self.client is None:
            logger.warning("ChromaDB is not available, returning None for collection", name=name)
            return None
        try:
            return self.client.get_or_create_collection(name=name)
        except Exception as e:
            logger.error("ChromaDB get_collection failed", name=name, error=str(e))
            raise e

def get_chroma_client() -> chromadb.PersistentClient:
    return ChromaClientSingleton().get_client()

def get_collection(name: str):
    return ChromaClientSingleton().get_collection(name)
