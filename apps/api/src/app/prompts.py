"""
Prompts for the NeuroFinance API.

This module re-exports the prompt functionality from the neurofinance_agents package.
"""

import logging
from typing import Optional, List
from neurofinance_agents import get_system_prompt, generate_finance_prompt

logger = logging.getLogger(__name__)

# Re-export the system prompt from neurofinance_agents
SYSTEM_PROMPT = get_system_prompt()

def generate_prompt(dataset_identifier: Optional[str], years: Optional[List[int]]) -> str:
    """
    Generate a prompt for the finance agent.
    
    This is a wrapper around the generate_finance_prompt function from neurofinance_agents
    that adapts the interface to match the existing code.
    
    Args:
        dataset_identifier: The dataset identifier
        years: Optional list of years to filter by
        
    Returns:
        The generated prompt
    """
    # Currently, we ignore the years parameter as it's not used in the new implementation
    # In the future, we could pass this through to the generate_finance_prompt function
    
    logger.debug(f"Generating prompt for dataset: {dataset_identifier}")
    return generate_finance_prompt(
        question="",  # This will be set later in the agent service
        output_dir="",  # This will be set later in the agent service
        dataset_description=None  # We'll use the default from the package
    ) 