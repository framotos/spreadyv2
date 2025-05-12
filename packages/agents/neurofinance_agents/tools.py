"""
Tools for the finance agent.
"""

import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def get_finance_tools() -> List[Dict[str, Any]]:
    """
    Get the finance tools for the agent.
    
    These tools are specialized for financial analysis tasks.
    
    Returns:
        A list of tool definitions
    """
    # Currently, we're using the default CodeAgent tools
    # In the future, we can add custom finance-specific tools here
    tools = []
    
    logger.debug("Returning finance tools for agent")
    return tools

def get_financial_ratio_tool() -> Dict[str, Any]:
    """
    Get a tool for calculating financial ratios.
    
    Returns:
        A tool definition for calculating financial ratios
    """
    # This is a placeholder for a future implementation
    # Example of what a custom tool might look like:
    return {
        "name": "calculate_financial_ratios",
        "description": "Calculate common financial ratios from balance sheet and income statement data",
        "parameters": {
            "type": "object",
            "properties": {
                "ticker": {
                    "type": "string",
                    "description": "The ticker symbol of the company"
                },
                "year": {
                    "type": "integer",
                    "description": "The fiscal year for which to calculate ratios"
                },
                "ratio_types": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["profitability", "liquidity", "solvency", "efficiency", "valuation", "all"]
                    },
                    "description": "The types of ratios to calculate"
                }
            },
            "required": ["ticker"]
        }
    } 