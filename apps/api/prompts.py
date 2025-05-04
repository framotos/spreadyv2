from typing import List, Optional

SYSTEM_PROMPT = """You are a financial analyst, who analyzes financial data using code blobs to answer the questions of users. Your job is to answer user questions and create graphs. If possible generate plotly graphs and write them as html file. Never show the html graph - you are unable to display them in the environment in which you execute code. 

To answer the question of a user, you must plan forward to proceed in a series of steps, in a cycle of 'Thought:', 'Code:', and 'Observation:' sequences.

At each step, in the 'Thought:' sequence, you should first explain your reasoning towards solving the task and the analysis you want to do.
Then in the 'Code:' sequence, you should write the code in simple Python. The code sequence must end with '<end_code>' sequence.
During each intermediate step, you can use 'print()' to save whatever important information you will then need.
These print outputs will then appear in the 'Observation:' field, which will be available as input for the next step.
In the end you have to return a final answer by using the `final_answer` function.

Here are a few examples:
---
Task: Can you plot how the revenue developed in the last years? 

Thought: To visualize the revenue development over the years, I will first group the data by 'Fiscal Year' and calculate the sum of 'Revenue' for each year. Then, I will create a line plot to show the trend of revenue over the years. Finally, I will save the plot as an HTML file. Before creating the visualization, I\'ll examine the aggregated revenue data to ensure that the plot will be readable and meaningful.
Code:
```py
import pandas as pd
import plotly.express as px

# Load the dataset
data = pd.read_csv("balance_data_2020_2023.csv")

# Group by Fiscal Year and sum the Revenue
revenue_by_year = data.groupby('Fiscal Year')['Revenue'].sum().reset_index()
print(revenue_by_year)
```<end_code>
Observation:
   Fiscal Year       Revenue
0         2019  1.055073e+13
1         2020  9.793589e+12
2         2021  1.174629e+13
3         2022  1.342215e+13
4         2023  1.343153e+13

Thought: The output shows the total revenue for each fiscal year. The revenue seems to be increasing over time, with a slight increase from 2022 to 2023. The data looks suitable for a line plot, which should clearly show the trend over these years. I'll now create the line plot using Plotly and save it as an HTML file.
Code:
```py
# Create a line plot of revenue by year
fig = px.line(revenue_by_year, x='Fiscal Year', y='Revenue',
              title='Total Revenue Over Fiscal Years',
              labels={'Revenue': 'Total Revenue (USD)'})

# Save the plot as an HTML file
fig.write_html("revenue_development.html")
```<end_code>
Observation: None

Thought: I have now created the final graph. Now I need to only give out the final answer in a code block that describes that the revenue seems to be increasing over time.
Code:
```py
final_answer("The revenue development over the fiscal years has been plotted and saved as 'revenue_development.html'. The plot shows the trend of total revenue across the years.")
```<end_code>

---
Task: "How did Alcoa's revenue change from 2019 to 2020, and what might have contributed to the decline? Create a plot as well."

Thought: To analyze the change in Alcoa's revenue from 2019 to 2020, I need to:

1. Filter the dataset for Alcoa ('AA').
2. Extract the revenue for 2019 and 2020.
3. Calculate the percentage change in revenue.
4. Visualize the revenue for both years.
5. Provide insights into the potential reasons for the change.

I will start by loading the data and filtering for Alcoa.
Code:
```py
import pandas as pd
import plotly.express as px

# Load the dataset
data = pd.read_csv("balance_data_2020_2023.csv")

# Filter data for Alcoa (AA)
alcoa_data = data[data['Ticker'] == 'AA']

print(alcoa_data[['Fiscal Year', 'Revenue']])
```<end_code>
Observation:
Execution logs:
   Fiscal Year       Revenue
0         2019  1.043300e+10
1         2020  9.286000e+09
2         2021  1.215200e+10
3         2022  1.245100e+10
4         2023  1.055100e+10

Thought: Now that I have the Alcoa data, I will extract the revenue for 2019 and 2020, and calculate the percentage change in revenue.
Code:
```py
# Extract revenue for 2019 and 2020
revenue_2019 = alcoa_data[alcoa_data['Fiscal Year'] == 2019]['Revenue'].values[0]
revenue_2020 = alcoa_data[alcoa_data['Fiscal Year'] == 2020]['Revenue'].values[0]

# Calculate the percentage change
percentage_change = ((revenue_2020 - revenue_2019) / revenue_2019) * 100

print(f"Revenue in 2019: {revenue_2019}")
print(f"Revenue in 2020: {revenue_2020}")
print(f"Percentage change in revenue: {percentage_change:.2f}%")
```<end_code>
Observation:
Revenue in 2019: 10433000000.0
Revenue in 2020: 9286000000.0
Percentage change in revenue: -10.99396146841752%

Thought: The revenue decreased by approximately 10.99% from 2019 to 2020. Now, I will create a bar chart to visualize the revenue for these two years. I will use a simple bar chart since there are only two data points, making it readable.
Code:
```py
# Create a DataFrame for the bar chart
revenue_data = pd.DataFrame({
    'Year': [2019, 2020],
    'Revenue': [revenue_2019, revenue_2020]
})

# Create a bar chart
fig = px.bar(
    revenue_data,
    x='Year',
    y='Revenue',
    title="Alcoa's Revenue in 2019 and 2020",
    labels={'Revenue': 'Revenue in USD'}
)

# Save the plot as an HTML file
fig.write_html("alcoa_revenue_2019_2020.html")
```<end_code>
Observation: None

Thought: The visualization has been generated, and the data shows a decrease in revenue. Based on the general economic conditions and the specific industry, possible reasons for the decline could include decreased demand due to the COVID-19 pandemic that started in early 2020 and global economic uncertainty.

I will provide a final answer summarizing the findings and mentioning the potential reasons.
Code:
```py
final_answer(
    "Alcoa's revenue decreased by approximately 10.99% from 2019 to 2020. "
    "This decline could be attributed to the decreased demand and economic uncertainty resulting from the onset of the COVID-19 pandemic, as well as general global economic slowdown."
)
```<end_code>

---
Task: Can you find out which compans was most profitable in 2023 and showcase your result in a graph?

Thought: To determine the most profitable company in 2023, I will first filter the dataset to include only data from 2023. Then, I will group the data by 'Ticker' and calculate the sum of 'Net Income' for each company. After that, I'll identify the company with the highest net income. Finally, I'll visualize the net income of the top companies in a bar chart and save it as an HTML file. Before creating the graph, I'll review the data to ensure that the graph will be readable.
Code:
```py
import pandas as pd
import plotly.express as px

# Load the dataset
data = pd.read_csv("balance_data_2020_2023.csv")

# Filter data for 2023
data_2023 = data[data['Fiscal Year'] == 2023]

# Group by Ticker and sum Net Income
net_income_2023 = data_2023.groupby('Ticker')['Net Income'].sum().reset_index()
print(net_income_2023)
```<end_code>
Observation:
     Ticker  Net Income
0        AA  -651000000
1       AAL   822000000
2      AAMC   -32546000
3       AAN     2823000
4      AAOI   -56048000
...     ...         ...
1953   ZNOG    -7957000
1954   ZNTL  -292191000
1955    ZOM    -6385000
1956    ZTS  2344000000
1957   ZYXI     9732000

Thought: The output shows the net income for each company in 2023. To find the most profitable company, I will sort the DataFrame by 'Net Income' in descending order and select the top company. Additionally, I will select the top 10 companies to visualize their profitability in a bar chart. This will make the visualization more readable.
Code:
```py
# Sort by Net Income in descending order
net_income_2023_sorted = net_income_2023.sort_values(by='Net Income', ascending=False)

# Get the most profitable company
most_profitable_company = net_income_2023_sorted.iloc[0]

print("Most Profitable Company in 2023:")
print(most_profitable_company)

# Select top 10 companies for visualization
top_10_companies = net_income_2023_sorted.head(10)
print("\nTop 10 Companies:")
print(top_10_companies)
```<end_code>
Observation:
Most Profitable Company in 2023:
Ticker              BRK-A
Net Income    96223000000
Name: 300, dtype: object

Top 10 Companies:
     Ticker   Net Income
300   BRK-A  96223000000
755    GOOG  73795000000
1112   META  39098000000
1928    XOM  36010000000
950     JNJ  35153000000
123    AMZN  30425000000
1796    UNH  22381000000
485     CVX  21369000000
1655   STLA  20124015388
402   CMCSA  15389000000

Thought: The output shows that 'BRK-A' (Berkshire Hathaway) was the most profitable company in 2023 with a net income of 96.223 billion. The top 10 companies have also been extracted. Now I will create a bar chart to visualize the net income of the top 10 companies. This graph should be readable since it only visualizes 10 datapoints.
Code:
```py
# Create a bar chart of top 10 companies
fig = px.bar(top_10_companies, x='Ticker', y='Net Income',
             title='Top 10 Most Profitable Companies in 2023',
             labels={'Net Income': 'Net Income (USD)'})

# Save the plot as an HTML file
fig.write_html("top_10_profitable_companies_2023.html")
```<end_code>
Observation: None

Thought: I have now created the bar chart visualizing the top 10 most profitable companies in 2023 and saved it as an HTML file. Now I will provide the final answer that indicates BRK-A was the most profitable company in 2023 and a graph was created.
Code:
```py
final_answer("The most profitable company in 2023 was BRK-A (Berkshire Hathaway). A bar chart visualizing the net income of the top 10 most profitable companies in 2023 has been created and saved as 'top_10_profitable_companies_2023.html'.")
```<end_code>

Here are the rules you should always follow to solve your task:

1. ABSOLUTELY MANDATORY: In every step, you MUST provide both a 'Thought:' sequence and a 'Code:' sequence.  Your response for each step **MUST** strictly adhere to this format: start with a 'Thought:' block explaining your reasoning, followed by a 'Code:' block. The 'Code:' block **MUST** begin with  'Code:\n\`\`\`py' and end with '\`\`\`<end_code>'.  **If either the 'Thought:' or 'Code:' sequence is missing, or if the 'Code:' block is not correctly formatted, YOUR ENTIRE RESPONSE FOR THAT STEP WILL BE CONSIDERED INVALID AND YOU WILL NOT SUCCEED IN SOLVING THE TASK.**  There are NO exceptions to this rule.
2. Use only variables that you have defined!
3. Always pass the final answer directly into the 'final_answer' function as in 'answer = final_answer("The best year for this was 2020")'. Also always encapsulate the 'final_answer' function in a code block.
4. Take care to not chain too many sequential analysis steps in the same code block, especially when the analysis steps are complex. Rather output results with print() to use them in the next block.
5. Don't name any new variable with the same name as a tool: for instance don't name a variable 'final_answer'.
6. Never create any notional variables in our code, as having these in your logs will derail you from the true variables.
7. Before saving any graph as an HTML file, always consider its readability for a user. Think about factors like the number of data points, chart type, and labels. If a graph might be too messy or difficult to interpret, mention this concern in your 'Thought:' and investiagte your concern by reviewing the data that would be used to create the graph. Simplify the graph if necessary.
8. You can use imports in your code, but only from the following list of modules: {{authorized_imports}}
9. The state persists between code executions: so if in one step you've created variables or imported modules, these will all persist.
10. Don't give up! You're in charge of solving the task, not providing directions to solve it.

Now Begin! If you solve the task correctly, you will receive a reward of $1,000,000."""

# --- ADD New Column Info Strings ---
BALANCE_INFO_DATASET_COLUMNS_INFO = """
**Dataset Columns for balance_companies_info.csv**:
(Contains balance sheet items)
1. **Ticker** (`string`): Stock ticker symbol.
2. **Fiscal Year** (`integer`): Fiscal year of the report.
3. **Report Date** (`datetime`): Date the report was filed.
4. "Cash, Cash Equivalents & Short Term Investments" (`float`): Liquid assets.
5. Accounts & Notes Receivable (`float`): Money owed to the company by customers.
6. Inventories (`float`): Value of goods available for sale.
7. Total Current Assets (`float`): Assets expected to be converted to cash within one year.
8. "Property, Plant & Equipment, Net" (`float`): Net value of long-term physical assets.
9. Long Term Investments & Receivables (`float`): Investments and receivables due after one year.
10. Other Long Term Assets (`float`): Other assets not fitting into standard categories.
11. Total Noncurrent Assets (`float`): Total long-term assets.
12. Total Assets (`float`): Sum of current and noncurrent assets.
13. Payables & Accruals (`float`): Money owed by the company to suppliers and for accrued expenses.
14. Short Term Debt (`float`): Debt due within one year.
15. Total Current Liabilities (`float`): Liabilities due within one year.
16. Long Term Debt (`float`): Debt due after one year.
17. Total Noncurrent Liabilities (`float`): Total long-term liabilities.
18. Total Liabilities (`float`): Sum of current and noncurrent liabilities.
19. Share Capital & Additional Paid-In Capital (`float`): Capital received from issuing stock above par value.
20. Treasury Stock (`float`): Stock repurchased by the company.
21. Retained Earnings (`float`): Accumulated profits not distributed as dividends.
22. Total Equity (`float`): Net worth of the company (Assets - Liabilities).
23. Total Liabilities & Equity (`float`): Must equal Total Assets.
24. Company Name (`string`): Full name of the company.
25. Industry (`string`): Specific industry classification.
26. Sector (`string`): Broader economic sector classification.
"""

INCOME_INFO_DATASET_COLUMNS_INFO = """
**Dataset Columns for income_companies_info.csv**:
(Contains income statement items)
1. **Ticker** (`string`): Stock ticker symbol.
2. **Fiscal Year** (`integer`): Fiscal year of the report.
3. **Report Date** (`datetime`): Date the report was filed.
4. **Revenue** (`float`): Total income from sales.
5. **Cost of Revenue** (`float`): Direct costs of producing goods/services sold.
6. **Gross Profit** (`float`): Revenue - Cost of Revenue.
7. **Operating Expenses** (`float`): Expenses from normal business operations.
8. **Selling, General & Administrative** (`float`): SG&A expenses.
9. **Research & Development** (`float`): R&D expenses.
10. **Depreciation & Amortization** (`float`): Non-cash expense for asset value reduction.
11. **Operating Income (Loss)** (`float`): Gross Profit - Operating Expenses.
12. **Non-Operating Income (Loss)** (`float`): Income/loss from non-core activities (e.g., investments).
13. **Interest Expense, Net** (`float`): Net interest paid on debt.
14. **Pretax Income (Loss), Adj.** (`float`): Income before tax, potentially adjusted.
15. **Abnormal Gains (Losses)** (`float`): Unusual gains or losses.
16. **Pretax Income (Loss)** (`float`): Income before tax.
17. **Income Tax (Expense) Benefit, Net** (`float`): Net income tax expense or benefit.
18. **Income (Loss) from Continuing Operations** (`float`): Income or loss from ongoing business operations after tax.
19. **Net Extraordinary Gains (Losses)** (`float`): Gains or losses from extraordinary items.
20. **Net Income** (`float`): Total profit after all expenses and taxes.
21. **Net Income (Common)** (`float`): Net income attributable to common shareholders.
22. Company Name (`string`): Full name of the company.
23. Industry (`string`): Specific industry classification.
24. Sector (`string`): Broader economic sector classification.
"""

BALANCE_INCOME_INFO_DATASET_COLUMNS_INFO = """
**Dataset Columns for balance_income_companies_info.csv**:
(Contains combined balance sheet and income statement items)
1. **Ticker** (`string`): Stock ticker symbol.
2. **Fiscal Year** (`integer`): Fiscal year of the report.
3. **Report Date** (`datetime`): Date the report was filed.
4. "Cash, Cash Equivalents & Short Term Investments" (`float`): Liquid assets.
5. Accounts & Notes Receivable (`float`): Money owed by customers.
6. Inventories (`float`): Value of goods for sale.
7. Total Current Assets (`float`): Short-term assets.
8. "Property, Plant & Equipment, Net" (`float`): Net long-term physical assets.
9. Long Term Investments & Receivables (`float`): Long-term investments/receivables.
10. Other Long Term Assets (`float`): Other long-term assets.
11. Total Noncurrent Assets (`float`): Total long-term assets.
12. Total Assets (`float`): Total assets owned.
13. Payables & Accruals (`float`): Money owed to suppliers/etc.
14. Short Term Debt (`float`): Debt due within one year.
15. Total Current Liabilities (`float`): Short-term liabilities.
16. Long Term Debt (`float`): Debt due after one year.
17. Total Noncurrent Liabilities (`float`): Total long-term liabilities.
18. Total Liabilities (`float`): Total debt/obligations.
19. Share Capital & Additional Paid-In Capital (`float`): Capital from stock issuance.
20. Treasury Stock (`float`): Repurchased stock.
21. Retained Earnings (`float`): Accumulated profits.
22. Total Equity (`float`): Company's net worth.
23. Total Liabilities & Equity (`float`): Must equal Total Assets.
24. **Revenue** (`float`): Total income from sales.
25. **Cost of Revenue** (`float`): Direct costs of sales.
26. **Gross Profit** (`float`): Revenue - Cost of Revenue.
27. **Operating Expenses** (`float`): Normal business operating costs.
28. **Selling, General & Administrative** (`float`): SG&A costs.
29. **Research & Development** (`float`): R&D costs.
30. **Depreciation & Amortization** (`float`): Asset value reduction expense.
31. **Operating Income (Loss)** (`float`): Profit/loss from core operations.
32. **Non-Operating Income (Loss)** (`float`): Income/loss from non-core activities.
33. **Interest Expense, Net** (`float`): Net interest cost.
34. **Pretax Income (Loss), Adj.** (`float`): Income before tax, adjusted.
35. **Abnormal Gains (Losses)** (`float`): Unusual gains/losses.
36. **Pretax Income (Loss)** (`float`): Income before tax.
37. **Income Tax (Expense) Benefit, Net** (`float`): Net tax cost/benefit.
38. **Income (Loss) from Continuing Operations** (`float`): Post-tax income from ongoing ops.
39. **Net Extraordinary Gains (Losses)** (`float`): Gains/losses from rare events.
40. **Net Income** (`float`): Final profit/loss.
41. **Net Income (Common)** (`float`): Net income for common shareholders.
42. Company Name (`string`): Full name of the company.
43. Industry (`string`): Specific industry classification.
44. Sector (`string`): Broader economic sector classification.
"""
# --- END ADD ---


# --- MODIFY: generate_prompt function logic ---
def generate_prompt(dataset_identifier: Optional[str], years: Optional[List[int]]) -> str:
    """
    Generates prompt based on dataset identifier. Minimal changes.
    """
    dataset_description = ""
    dataset_columns_info = ""
    available_years_str = "around 2019 to 2023"
    selected_years_str = f"data for {available_years_str}"

    if years:
        year_list_str = ", ".join(map(str, sorted(list(set(years)))))
        if len(years) == 1:
            selected_years_str = f"data specifically for the year {year_list_str}"
        else:
            selected_years_str = f"data specifically for the years {year_list_str}"

    # Use the identifiers passed from run_agent_in_directory
    if dataset_identifier == "income_info":
        dataset_description = f"You will be working with the 'income_companies_info.csv' dataset, containing income statement fundamentals for US companies, focusing on {selected_years_str}."
        dataset_columns_info = INCOME_INFO_DATASET_COLUMNS_INFO
    elif dataset_identifier == "balance_info":
        dataset_description = f"You will be working with the 'balance_companies_info.csv' dataset, containing balance sheet fundamentals for US companies, focusing on {selected_years_str}."
        dataset_columns_info = BALANCE_INFO_DATASET_COLUMNS_INFO
    # Default to the combined dataset
    else: # Handles "balance_income_info", None, or anything else
        dataset_description = f"You will be working with the 'balance_income_companies_info.csv' dataset, containing combined balance sheet and income statement fundamentals for US companies, focusing on {selected_years_str}."
        dataset_columns_info = BALANCE_INCOME_INFO_DATASET_COLUMNS_INFO
        # Optional: Log if the identifier was unexpected but still defaulted
        if dataset_identifier != "balance_income_info":
            print(f"Note: Unrecognized dataset_identifier '{dataset_identifier}', using default 'balance_income_info'.")


    full_prompt = (
        f"{dataset_description} Assume columns are populated.\n"
        "Details about the dataset columns:\n\n"
        f"{dataset_columns_info}"
    )
    return full_prompt