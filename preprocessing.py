import pandas as pd
import os
import simfin as sf

# --- Configuration ---
RAW_DATA_DIR = "simfin_data"
RAW_INCOME_FILENAME = "us-income-annual.csv"
RAW_BALANCE_FILENAME = "us-balance-annual.csv"
RAW_COMPANIES_FILENAME = "us-companies.csv"

OUTPUT_DIR = "app/backend/data"
OUTPUT_BALANCE_COMPANIES_FILENAME = "balance_companies_info.csv"
OUTPUT_INCOME_COMPANIES_FILENAME = "income_companies_info.csv"
OUTPUT_BALANCE_INCOME_COMPANIES_FILENAME = "balance_income_companies_info.csv"

SIMFIN_API_KEY = 'YOUR_API_KEY' # IMPORTANT: Replace with your key
SIMFIN_DATA_DIR = '~/simfin_data/'

REQUIRED_OCCURRENCES = 5
TARGET_REPORT_MONTH = 12
TARGET_REPORT_DAY = 31
COLUMNS_TO_REMOVE_FINANCIAL = [
    'SimFinId', 'Currency', 'Fiscal Period', 'Publish Date',
    'Restated Date', 'Shares (Basic)', 'Shares (Diluted)'
]
MERGE_KEYS_FINANCIAL = ['Ticker', 'Report Date']

# --- Helper Function for Financial Data Preprocessing (Simplified) ---
def preprocess_financial(input_path):
    df = pd.read_csv(input_path, sep=";")
    ticker_counts = df['Ticker'].value_counts()
    tickers_to_keep = ticker_counts[ticker_counts == REQUIRED_OCCURRENCES].index
    df_filtered = df[df['Ticker'].isin(tickers_to_keep)].copy()

    numeric_cols = df_filtered.select_dtypes(include=['number']).columns
    df_filtered.loc[:, numeric_cols] = df_filtered.loc[:, numeric_cols].fillna(df_filtered[numeric_cols].mean())

    df_filtered['Report Date'] = pd.to_datetime(df_filtered['Report Date'])
    df_filtered = df_filtered[
        (df_filtered['Report Date'].dt.month == TARGET_REPORT_MONTH) &
        (df_filtered['Report Date'].dt.day == TARGET_REPORT_DAY)
    ].copy()

    df_simplified = df_filtered.drop(columns=COLUMNS_TO_REMOVE_FINANCIAL, errors='ignore')
    return df_simplified

# --- Main Execution ---
print("Starting simplified data processing...")

# 1. Preprocess Financial Data
income_cleaned_df = preprocess_financial(os.path.join(RAW_DATA_DIR, RAW_INCOME_FILENAME))
balance_cleaned_df = preprocess_financial(os.path.join(RAW_DATA_DIR, RAW_BALANCE_FILENAME))
print(f"Preprocessed Income shape: {income_cleaned_df.shape}, Balance shape: {balance_cleaned_df.shape}")

# 2. Load and Prepare Company/Industry Info
companies_info_df = pd.read_csv(os.path.join(RAW_DATA_DIR, RAW_COMPANIES_FILENAME), sep=";")

sf.set_api_key(SIMFIN_API_KEY)
sf.set_data_dir(SIMFIN_DATA_DIR)
mapping_df = sf.load_industries() # Assumes index is IndustryId

merged_company_industry_df = pd.merge(
    companies_info_df,
    mapping_df,
    left_on='IndustryId',
    right_index=True,
    how='left'
)
# Keep only relevant columns and unique Tickers for merging
cols_to_keep = ['Ticker', 'Company Name', 'Industry', 'Sector']
company_info_to_merge = merged_company_industry_df[
    [col for col in cols_to_keep if col in merged_company_industry_df.columns]
].drop_duplicates(subset=['Ticker'])
print(f"Company Info ready for merge shape: {company_info_to_merge.shape}")


# 3. Create and Save Final Datasets

# --- Dataset 1: Balance + Companies Info ---
balance_companies_info = pd.merge(
    balance_cleaned_df, company_info_to_merge, on='Ticker', how='left'
)
balance_companies_info.to_csv(
    os.path.join(OUTPUT_DIR, OUTPUT_BALANCE_COMPANIES_FILENAME), index=False
)
print(f"Saved {OUTPUT_BALANCE_COMPANIES_FILENAME}: {balance_companies_info.shape}")

# --- Dataset 2: Income + Companies Info ---
income_companies_info = pd.merge(
    income_cleaned_df, company_info_to_merge, on='Ticker', how='left'
)
income_companies_info.to_csv(
    os.path.join(OUTPUT_DIR, OUTPUT_INCOME_COMPANIES_FILENAME), index=False
)
print(f"Saved {OUTPUT_INCOME_COMPANIES_FILENAME}: {income_companies_info.shape}")

# --- Dataset 3: Balance + Income + Companies Info ---
# Merge cleaned financials first
common_cols_to_drop = income_cleaned_df.columns.intersection(balance_cleaned_df.columns).difference(MERGE_KEYS_FINANCIAL)
income_reduced = income_cleaned_df.drop(columns=common_cols_to_drop, errors='ignore')
balance_income_combined = pd.merge(
    balance_cleaned_df, income_reduced, on=MERGE_KEYS_FINANCIAL, how='inner'
)

# Merge combined financials with company info
balance_income_companies_info = pd.merge(
    balance_income_combined, company_info_to_merge, on='Ticker', how='left'
)
balance_income_companies_info.to_csv(
    os.path.join(OUTPUT_DIR, OUTPUT_BALANCE_INCOME_COMPANIES_FILENAME), index=False
)
print(f"Saved {OUTPUT_BALANCE_INCOME_COMPANIES_FILENAME}: {balance_income_companies_info.shape}")

print("\nSimplified data processing complete.")