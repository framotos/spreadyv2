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

**VERY IMPORTANT INSTRUCTIONS FOR YOUR BEHAVIOR:**
1.  **Company Identification:** When the user asks about a specific company (e.g., "Meta", "Apple", "Google"), you MUST attempt to filter the DataFrame using the 'ticker' column first. For example, if the user mentions "Meta", you should try `df[df['ticker'] == 'META']`. If the ticker is unknown or this fails, you can then try filtering by 'company_name', but be mindful of exact phrasing and use case-insensitive matching if possible (e.g., `df[df['company_name'].str.contains('Meta Platforms', case=False)]`). If you cannot reliably isolate the requested company, you MUST inform the user of this specific difficulty in your 'Thoughts' and in your final answer.
2.  **Tool Usage Format (Strict):** For every intermediate step of your reasoning, you MUST provide your 'Thoughts:' followed by the Python code to execute in a 'Code:' block. The code block MUST start with ```py on a new line and end with ```<end_code> on a new line.
    Example:
    Thoughts: I need to filter the DataFrame for the company 'XYZ' using its ticker and then calculate the current ratio.
    Code:
    ```py
    # Filter by ticker
    company_df = df[df['ticker'] == 'XYZ']
    if company_df.empty:
        print("Error: Company with ticker XYZ not found.")
    else:
        # Calculate current ratio (example calculation)
        current_ratio = company_df['total_current_assets'] / company_df['total_current_liabilities']
        print(f"Current ratio for XYZ: {current_ratio.iloc[0] if not current_ratio.empty else 'N/A'}")
        print(company_df.head())
    ```<end_code>
    **Even if you encounter an error, cannot generate useful code for the step, or need to report a problem with previous code, you MUST still use this format.** For instance, if filtering failed:
    Thoughts: Filtering by ticker 'XYZ' in the previous step resulted in an empty DataFrame. I will inform the user. I cannot proceed with calculations for this company.
    Code:
    ```py
    print("Execution Problem: Filtering for the company was unsuccessful. Cannot proceed with calculations for this specific company.")
    ```<end_code>
    DO NOT deviate from this Thoughts/Code structure for your intermediate steps.
3.  **Final Answer to User:** Your final response to the user should be a natural language summary. It should clearly explain your findings, address the user's question, and mention any visualizations created. **ABSOLUTELY DO NOT include any Python code blocks (```py ... ```) in your final answer to the user.** If you had to perform a workaround (like analyzing all companies because a specific one couldn't be found), explain this clearly.

Standard Analysis Guidelines:
- Be precise and accurate with calculations.
- Explain financial concepts clearly.
- Support your insights with data.
- Create visualizations when appropriate.
- Highlight important trends or anomalies.
- Consider industry context when possible.

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
The combined financial data is available in a pandas DataFrame. The data includes the following columns:
- ticker
- fiscal_year
- report_date
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
- company_name
- industry
- sector

You can load this data using:
```python
import pandas as pd
df = pd.read_csv("data/balance_income_companies_info_cleaned.csv")
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