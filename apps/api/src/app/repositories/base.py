from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Any

T = TypeVar('T')

class BaseRepository(ABC, Generic[T]):
    """
    Base repository interface with common methods.
    """
    
    @abstractmethod
    async def get_by_id(self, id: str) -> Optional[T]:
        """
        Get an entity by its ID.
        
        Args:
            id: The entity ID
            
        Returns:
            The entity if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def create(self, entity: T) -> T:
        """
        Create a new entity.
        
        Args:
            entity: The entity to create
            
        Returns:
            The created entity
        """
        pass
    
    @abstractmethod
    async def update(self, id: str, data: dict) -> Optional[T]:
        """
        Update an entity.
        
        Args:
            id: The entity ID
            data: The data to update
            
        Returns:
            The updated entity if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def delete(self, id: str) -> bool:
        """
        Delete an entity.
        
        Args:
            id: The entity ID
            
        Returns:
            True if deleted, False otherwise
        """
        pass 