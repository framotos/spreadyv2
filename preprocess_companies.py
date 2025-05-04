import pandas as pd
import os
import re
import traceback

# --- Configuration ---
# Use the *cleaned* combined file as the source for unique companies list
# Assume original income/balance files exist for their respective processing
input_combined_source_path = 'apps/api/data/balance_income_companies_info_cleaned.csv' # CHANGED
input_income_csv_path = 'apps/api/data/income_companies_info.csv'
input_balance_csv_path = 'apps/api/data/balance_companies_info.csv'

output_unique_companies_path = 'apps/api/data/companies_unique_info.csv'
output_cleaned_income_path = 'apps/api/data/income_companies_info_cleaned.csv'
output_cleaned_balance_path = 'apps/api/data/balance_companies_info_cleaned.csv'

# Columns for the unique companies file (using cleaned names now)
company_info_columns_cleaned = ['ticker', 'company_name', 'industry', 'sector']

# Company metadata columns to drop from financial files (using original names for lookup in mapping)
metadata_columns_to_drop_original = ['Company Name', 'Industry', 'Sector']

# Columns to clean data within (remove quotes from values) (using original names for lookup)
text_columns_to_clean = ['Company Name', 'Industry', 'Sector']

# --- Helper Function for Cleaning Column Names ---
def clean_col_name(col_name):
    name = col_name.strip()
    name = name.replace('"', '')
    name = re.sub(r',\s*\(Loss\)', '_loss', name, flags=re.IGNORECASE)
    name = re.sub(r',\s*Adj\.', '_adj', name, flags=re.IGNORECASE)
    name = re.sub(r',\s*Net', '_net', name, flags=re.IGNORECASE)
    name = re.sub(r'[\s,&/()]+|-|\'', '_', name)
    name = name.strip('_')
    name = name.lower()
    name = re.sub(r'_{2,}', '_', name)
    return name

# --- Helper Function to Clean Text Data in Columns (using cleaned column names) ---
def clean_text_data(df, cleaned_text_cols):
    print(f"  Cleaning data in columns: {cleaned_text_cols}")
    df_cleaned = df.copy()
    for col in cleaned_text_cols:
        # Only clean if the column exists in the dataframe
        if col in df_cleaned.columns and pd.api.types.is_string_dtype(df_cleaned[col]):
            df_cleaned[col] = df_cleaned[col].fillna('').astype(str).str.replace('"', '', regex=False)
    return df_cleaned

print(f"Starting preprocessing...")

# --- Generate Comprehensive Unique Companies List (from existing cleaned combined file) --- 
try:
    print(f"\n--- Generating Unique Companies File from: {input_combined_source_path} ---")
    # Read the already cleaned combined file
    df_combined_cleaned = pd.read_csv(input_combined_source_path)
    print(f"Read {len(df_combined_cleaned)} rows for company info.")

    # Headers should already be clean, but verify required columns exist
    if not set(company_info_columns_cleaned).issubset(df_combined_cleaned.columns):
        print(f"Error: Required columns {company_info_columns_cleaned} not found in {input_combined_source_path}.")
        exit(1)
        
    print(f"Extracting unique companies info (Columns: {company_info_columns_cleaned})...")
    df_companies = df_combined_cleaned[company_info_columns_cleaned].copy()
    
    print("Dropping duplicates based on ticker...")
    num_before_dedupe = len(df_companies)
    df_unique_companies = df_companies.drop_duplicates(subset=['ticker'], keep='first')
    num_after_dedupe = len(df_unique_companies)
    print(f"Found {num_after_dedupe} unique tickers (dropped {num_before_dedupe - num_after_dedupe}).")

    # Clean text data (quotes) in the final unique list
    print("Cleaning text data in unique companies list...")
    # Pass the list of *cleaned* column names directly
    df_unique_companies = clean_text_data(df_unique_companies, ['company_name', 'industry', 'sector']) 

    print(f"Saving comprehensive unique company info to: {output_unique_companies_path}")
    df_unique_companies.to_csv(output_unique_companies_path, index=False)
    print("Unique companies file saved.")

except FileNotFoundError:
    print(f"Error: Input file not found at {input_combined_source_path}. Cannot generate unique companies file.")
    exit(1) # Exit if we can't generate the essential companies file
except KeyError as e:
    print(f"Error: Column mismatch accessing {input_combined_source_path} - {e}.")
    exit(1)
except Exception as e:
    print(f"An error occurred generating unique companies file: {e}")
    print(traceback.format_exc())
    exit(1)

# --- Process Income File (reading original, cleaning, saving cleaned) --- 
try:
    print(f"\n--- Processing Income File: {input_income_csv_path} ---")
    df_income_orig = pd.read_csv(input_income_csv_path)
    print(f"Read {len(df_income_orig)} rows.")

    print("Cleaning column names (Income)...")
    original_columns_income = df_income_orig.columns.tolist()
    col_mapping_income = {orig: clean_col_name(orig) for orig in original_columns_income}
    df_income = df_income_orig.copy()
    df_income.columns = [col_mapping_income[col] for col in original_columns_income]
    report_date_col_income = col_mapping_income.get('Report Date', 'report_date')
    print("Column names cleaned.")

    # Format Report Date
    if report_date_col_income in df_income.columns:
        print(f"Converting/Formatting '{report_date_col_income}' (Income)... ")
        df_income[report_date_col_income] = pd.to_datetime(df_income[report_date_col_income], errors='coerce').dt.strftime('%Y-%m-%d')
    else:
        print(f"Warning: '{report_date_col_income}' not found for date formatting (Income).")

    # Clean Text Data (using original names for lookup in mapping)
    print("Cleaning text data (Income)...")
    text_cols_to_clean_income = [col_mapping_income.get(col) for col in text_columns_to_clean if col_mapping_income.get(col) in df_income.columns]
    df_income = clean_text_data(df_income, text_cols_to_clean_income)

    # Drop metadata columns 
    metadata_cols_to_drop_cleaned = [col_mapping_income.get(col) for col in metadata_columns_to_drop_original if col_mapping_income.get(col) in df_income.columns]
    if metadata_cols_to_drop_cleaned:
        print(f"Dropping metadata columns: {metadata_cols_to_drop_cleaned}")
        df_income = df_income.drop(columns=metadata_cols_to_drop_cleaned, errors='ignore')
        
    # Deduplicate Income Data
    print(f"Deduplicating income data by (ticker, fiscal_year)...")
    num_before_dedupe = len(df_income)
    if 'ticker' in df_income.columns and 'fiscal_year' in df_income.columns:
        df_income = df_income.drop_duplicates(subset=['ticker', 'fiscal_year'], keep='first')
        num_after_dedupe = len(df_income)
        print(f"Dropped {num_before_dedupe - num_after_dedupe} duplicate income rows.")
    else:
        print("Warning: Could not find columns for income deduplication.")

    print(f"Saving cleaned income data to: {output_cleaned_income_path}")
    df_income.to_csv(output_cleaned_income_path, index=False)
    print("Cleaned income data file saved.")

except FileNotFoundError:
     print(f"Error: Input file not found at {input_income_csv_path}")
except KeyError as e:
    print(f"Error: Column mismatch processing income file - {e}.")
except Exception as e:
    print(f"An error occurred processing income file: {e}.")
    print(traceback.format_exc())

# --- Process Balance Sheet File (reading original, cleaning, saving cleaned) ---
try:
    print(f"\n--- Processing Balance Sheet File: {input_balance_csv_path} ---")
    df_balance_orig = pd.read_csv(input_balance_csv_path)
    print(f"Read {len(df_balance_orig)} rows.")

    print("Cleaning column names (Balance)...")
    original_columns_balance = df_balance_orig.columns.tolist()
    col_mapping_balance = {orig: clean_col_name(orig) for orig in original_columns_balance}
    df_balance = df_balance_orig.copy()
    df_balance.columns = [col_mapping_balance[col] for col in original_columns_balance]
    report_date_col_balance = col_mapping_balance.get('Report Date', 'report_date')
    print("Column names cleaned.")

    # Format Report Date
    if report_date_col_balance in df_balance.columns:
        print(f"Converting/Formatting '{report_date_col_balance}' (Balance)... ")
        df_balance[report_date_col_balance] = pd.to_datetime(df_balance[report_date_col_balance], errors='coerce').dt.strftime('%Y-%m-%d')
    else:
        print(f"Warning: '{report_date_col_balance}' not found for date formatting (Balance).")

    # Clean Text Data
    print("Cleaning text data (Balance)...")
    text_cols_to_clean_balance = [col_mapping_balance.get(col) for col in text_columns_to_clean if col_mapping_balance.get(col) in df_balance.columns]
    df_balance = clean_text_data(df_balance, text_cols_to_clean_balance)

    # Drop metadata columns
    metadata_cols_to_drop_cleaned = [col_mapping_balance.get(col) for col in metadata_columns_to_drop_original if col_mapping_balance.get(col) in df_balance.columns]
    if metadata_cols_to_drop_cleaned:
        print(f"Dropping metadata columns: {metadata_cols_to_drop_cleaned}")
        df_balance = df_balance.drop(columns=metadata_cols_to_drop_cleaned, errors='ignore')
        
    # Deduplicate Balance Sheet Data
    print(f"Deduplicating balance sheet data by (ticker, fiscal_year)...")
    num_before_dedupe = len(df_balance)
    if 'ticker' in df_balance.columns and 'fiscal_year' in df_balance.columns:
        df_balance = df_balance.drop_duplicates(subset=['ticker', 'fiscal_year'], keep='first')
        num_after_dedupe = len(df_balance)
        print(f"Dropped {num_before_dedupe - num_after_dedupe} duplicate balance sheet rows.")
    else:
        print("Warning: Could not find columns for balance sheet deduplication.")

    print(f"Saving cleaned balance sheet data to: {output_cleaned_balance_path}")
    df_balance.to_csv(output_cleaned_balance_path, index=False)
    print("Cleaned balance sheet data file saved.")

except FileNotFoundError:
     print(f"Error: Input file not found at {input_balance_csv_path}")
except KeyError as e:
    print(f"Error: Column mismatch processing balance sheet file - {e}.")
except Exception as e:
    print(f"An error occurred processing balance sheet file: {e}.")
    print(traceback.format_exc())

print("\nPreprocessing finished.") 