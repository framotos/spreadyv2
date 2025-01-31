sp_500_description = """
This dataset provides financial information for all S&P 500 companies across the last four fiscal years (today is 8th of November 2024). Each row captures one metric for a company for a statement type (Balance Sheet, Cash Flow, Income Statement) at a specific fiscal year-end date.
Below is a detailed description of each column, including data types and example values.

Column Descriptions:

company:
Data Type: String
Description: Represents the ticker symbol or short identifier of the company for which financial data is recorded.
Example Values: "MMM" (3M Company), "YUM" (Yum! Brands Inc.)


date
Data Type: DateTime (stored as a DateTime object in "YYYY-MM-DD" format)
Description: Indicates the fiscal year-end date for the reported financial figures. It represents the end of the fiscal year for which financial data is provided.
Example Values: 2023-12-31, 2022-12-31 (in DateTime format)


statement_type:
Data Type: String
Description: Specifies the type of financial statement from which the metric originates, such as Balance Sheet, Income Statement, or Cash Flow. This column is essential for distinguishing between different categories of financial data.
Only Values: "Balance Sheet", "Cash Flow", "Income Statement"


metric:
Data Type: String
Description: Provides the specific financial metric being recorded, such as asset counts, liability measures, revenue, expenses, or profit metrics. This is a categorical field and can contain diverse entries based on the type of statement.
Example Values: 'Net Income From Continuing Operations', 'Investing Cash Flow',
       'Operating Cash Flow', 'Free Cash Flow', 'Financing Cash Flow',
       'Changes In Cash', 'Beginning Cash Position', 'End Cash Position',
       'Change In Working Capital',
       'Cash Flow From Continuing Investing Activities',
       'Cash Flow From Continuing Operating Activities',
       'Cash Flow From Continuing Financing Activities', 'Total Assets',
       'Total Liabilities Net Minority Interest', 'Ordinary Shares Number',
       'Common Stock Equity', 'Total Equity Gross Minority Interest',
       'Share Issued', 'Tangible Book Value', 'Invested Capital',
       'Net Tangible Assets', 'Total Capitalization',
       'Cash And Cash Equivalents', 'Stockholders Equity', 'Common Stock',
       'Capital Stock', 'Long Term Debt And Capital Lease Obligation',
       'Total Debt', 'Retained Earnings', 'Net Issuance Payments Of Debt',
       'Net Long Term Debt Issuance', 'Receivables',
       'Net Common Stock Issuance',
       'Gains Losses Not Affecting Retained Earnings', 'Repayment Of Debt',
       'Payables And Accrued Expenses', 'Net Other Financing Charges',
       'Long Term Debt Payments', 'Pretax Income',
       'Diluted NI Availto Com Stockholders', 'Basic Average Shares',
       'Net Income From Continuing Operation Net Minority Interest',
       'Diluted Average Shares', 'Net Income Continuous Operations',
       'Tax Rate For Calcs', 'Normalized Income',
       'Net Income From Continuing And Discontinued Operation', 'Net Income',
       'Net Income Common Stockholders', 'Basic EPS', 'Tax Effect Of Unusual Items',
       'Net Income Including Noncontrolling Interests', 'Diluted EPS',
       'Operating Revenue', 'Total Revenue', 'Net PPE', 'Issuance Of Debt',
       'Depreciation And Amortization', 'Other Equity Adjustments',
       'Reconciled Depreciation', 'Accounts Receivable', 'Long Term Debt',
       'Tax Provision', 'Long Term Debt Issuance', 'Capital Expenditure',
       'Payables', 'Net Interest Income',
       'Depreciation Amortization Depletion', 'Other Non Cash Items',
       'Cash Cash Equivalents And Short Term Investments',
       'Change In Payables And Accrued Expense',
       'Current Debt And Capital Lease Obligation', 'Accounts Payable',
       'Interest Expense', 'Gross PPE', 'Repurchase Of Capital Stock',
       'Net Business Purchase And Sale',
       'Goodwill And Other Intangible Assets', 'Total Expenses', 'EBIT',
       'Common Stock Payments', 'Operating Gains Losses',
       'Change In Receivables', 'Net Non Operating Interest Income Expense',
       'Current Assets', 'Working Capital', 'Total Non Current Assets',
       'Current Liabilities',
       'Total Non Current Liabilities Net Minority Interest', 'Goodwill',
       'Selling General And Administration', 'Current Debt',
       'Accumulated Depreciation', 'Other Non Current Assets',
       'Purchase Of Business', 'Other Income Expense', 'Deferred Tax',
       'Deferred Income Tax', 'Additional Paid In Capital',
       'Interest Expense Non Operating'
       

value:
Data Type: Float (allows for decimals and NaN values for missing data)
Description: Contains the actual numerical value of the metric, which can represent counts, dollar amounts, or percentages depending on the metric. A NaN value indicates missing data, often due to unreported or unavailable figures for that specific metric/year.
Example Values: 391451920.0 (Treasury Shares Number), 1597000000.0 (Net Income From Continuing Operations), NaN (for missing data)"""