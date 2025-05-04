-- Seed data using pre-processed CSV files with cleaned headers and data

BEGIN;

-- 1. Create a temporary table for the UNIQUE COMPANY data
CREATE TEMP TABLE temp_companies (
    ticker TEXT PRIMARY KEY,
    company_name TEXT,
    industry TEXT,
    sector TEXT
);

-- 2. Use \copy to load data from the client-side unique companies CSV
-- Assumes psql is run from the repository root
\copy temp_companies (ticker, company_name, industry, sector) FROM 'apps/api/data/companies_unique_info.csv' WITH (FORMAT CSV, HEADER true);

-- 3. Populate the 'companies' table from the unique temp table
INSERT INTO companies (ticker, company_name, industry, sector)
SELECT
    ticker,
    company_name,
    industry,
    sector
FROM temp_companies
ON CONFLICT (ticker) DO NOTHING;

-- 4. Drop the unique companies temp table (no longer needed)
DROP TABLE temp_companies;

-- 5. Directly load cleaned, deduplicated income data into income_statements table
-- Assumes psql is run from the repository root
-- Headers in the CSV must match the table column names exactly
\copy income_statements (ticker, fiscal_year, report_date, revenue, cost_of_revenue, gross_profit, operating_expenses, selling_general_administrative, research_development, depreciation_amortization, operating_income_loss, non_operating_income_loss, interest_expense_net, pretax_income_loss_adj, abnormal_gains_losses, pretax_income_loss, income_tax_expense_benefit_net, income_loss_from_continuing_operations, net_extraordinary_gains_losses, net_income, net_income_common) FROM 'apps/api/data/income_companies_info_cleaned.csv' WITH (FORMAT CSV, HEADER true);

-- 6. Directly load cleaned, deduplicated balance sheet data into balance_sheets table
-- Assumes psql is run from the repository root
-- Headers in the CSV must match the table column names exactly
\copy balance_sheets (ticker, fiscal_year, report_date, cash_cash_equivalents_short_term_investments, accounts_notes_receivable, inventories, total_current_assets, property_plant_equipment_net, long_term_investments_receivables, other_long_term_assets, total_noncurrent_assets, total_assets, payables_accruals, short_term_debt, total_current_liabilities, long_term_debt, total_noncurrent_liabilities, total_liabilities, share_capital_additional_paid_in_capital, treasury_stock, retained_earnings, total_equity, total_liabilities_equity) FROM 'apps/api/data/balance_companies_info_cleaned.csv' WITH (FORMAT CSV, HEADER true);

-- Remove the old temp_financial_data table and associated inserts
-- DROP TABLE temp_financial_data;
-- (INSERT statements that used temp_financial_data are removed)

COMMIT; 