"""
Prompt templates for the finance agent.
"""

import logging

logger = logging.getLogger(__name__)

# System prompt for the finance agent
SYSTEM_PROMPT = """
You are a financial analyst AI assistant specialized in analyzing company financial data.
Your task is to help users understand financial statements, calculate financial ratios, 
identify trends, and provide insights based on the data available.

You have access to financial data including balance sheets and income statements.
You can create visualizations to help users understand the data better.

When providing analysis:
1. Be precise and accurate with calculations
2. Explain financial concepts clearly
3. Support your insights with data
4. Create visualizations when appropriate
5. Highlight important trends or anomalies
6. Consider industry context when possible

Always save visualizations to the specified output directory.
"""

# Dataset descriptions
DATASET_DESCRIPTIONS = {
    "balance_info": """
The balance sheet data is available in a pandas DataFrame. The data includes:
- ticker: The company's stock ticker symbol
- company_name: The name of the company
- fiscal_year: The fiscal year of the report
- report_date: The date of the report
- Balance sheet items like:
  - cash_cash_equivalents_short_term_investments
  - accounts_notes_receivable
  - inventories
  - total_current_assets
  - property_plant_equipment_net
  - long_term_investments_receivables
  - other_long_term_assets
  - total_noncurrent_assets
  - total_assets
  - payables_accruals
  - short_term_debt
  - total_current_liabilities
  - long_term_debt
  - total_noncurrent_liabilities
  - total_liabilities
  - share_capital_additional_paid_in_capital
  - treasury_stock
  - retained_earnings
  - total_equity
  - total_liabilities_equity

You can load this data using:
```python
import pandas as pd
df = pd.read_csv("balance_info.csv")
```
    """,
    
    "income_info": """
The income statement data is available in a pandas DataFrame. The data includes:
- ticker: The company's stock ticker symbol
- company_name: The name of the company
- fiscal_year: The fiscal year of the report
- report_date: The date of the report
- Income statement items like:
  - revenue
  - cost_of_revenue
  - gross_profit
  - operating_expenses
  - selling_general_administrative
  - research_development
  - depreciation_amortization
  - operating_income_loss
  - non_operating_income_loss
  - interest_expense_net
  - pretax_income_loss_adj
  - abnormal_gains_losses
  - pretax_income_loss
  - income_tax_expense_benefit_net
  - income_loss_from_continuing_operations
  - net_extraordinary_gains_losses
  - net_income
  - net_income_common

You can load this data using:
```python
import pandas as pd
df = pd.read_csv("income_info.csv")
```
    """,
    
    "balance_income_info": """
The combined financial data (balance sheet and income statement) is available in a pandas DataFrame. The data includes:
- ticker: The company's stock ticker symbol
- company_name: The name of the company
- fiscal_year: The fiscal year of the report
- report_date: The date of the report
- Balance sheet items like:
  - cash_cash_equivalents_short_term_investments
  - accounts_notes_receivable
  - inventories
  - total_current_assets
  - property_plant_equipment_net
  - long_term_investments_receivables
  - other_long_term_assets
  - total_noncurrent_assets
  - total_assets
  - payables_accruals
  - short_term_debt
  - total_current_liabilities
  - long_term_debt
  - total_noncurrent_liabilities
  - total_liabilities
  - share_capital_additional_paid_in_capital
  - treasury_stock
  - retained_earnings
  - total_equity
  - total_liabilities_equity
- Income statement items like:
  - revenue
  - cost_of_revenue
  - gross_profit
  - operating_expenses
  - selling_general_administrative
  - research_development
  - depreciation_amortization
  - operating_income_loss
  - non_operating_income_loss
  - interest_expense_net
  - pretax_income_loss_adj
  - abnormal_gains_losses
  - pretax_income_loss
  - income_tax_expense_benefit_net
  - income_loss_from_continuing_operations
  - net_extraordinary_gains_losses
  - net_income
  - net_income_common

You can load this data using:
```python
import pandas as pd
df = pd.read_csv("balance_income_info.csv")
```
    """
}

def get_system_prompt() -> str:
    """
    Get the system prompt for the finance agent.
    
    Returns:
        The system prompt
    """
    return SYSTEM_PROMPT

def generate_finance_prompt(
    question: str,
    output_dir: str,
    dataset_description: str = None
) -> str:
    """
    Generate a prompt for the finance agent.
    
    Args:
        question: The user's question
        output_dir: The output directory for visualizations
        dataset_description: Optional description of the dataset
        
    Returns:
        The generated prompt
    """
    # Use the combined dataset description if none is provided
    if not dataset_description:
        dataset_description = DATASET_DESCRIPTIONS["balance_income_info"]
    
    # Format the output directory for the prompt
    output_dir_path = output_dir.replace("\\", "/")
    
    # Create the prompt
    prompt = (
        f"This is the user question: {question}\n\n"
        f"{dataset_description}\n\n"
        f"The relevant financial data is available for your analysis. " 
        f"Please proceed with the analysis based on the user question and the described data structure.\n\n"
        f"If you are asked to create any graphs save them also in your user directory: '{output_dir_path}' like this: "
        f"`fig.write_html(\"{output_dir_path}/your_name_for_the_graph.html\")`.\n"
    )
    
    return prompt 