-- Migration: create_financial_tables
-- Tables: companies, income_statements, balance_sheets
-- Description: Create tables to store company metadata, income statements, and balance sheets.

BEGIN;

-- Table: companies
CREATE TABLE companies (
    ticker TEXT PRIMARY KEY,
    company_name TEXT,
    industry TEXT,
    sector TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE companies IS 'Stores unique company metadata, identified by stock ticker.';
COMMENT ON COLUMN companies.ticker IS 'Stock ticker symbol (Primary Key).';
COMMENT ON COLUMN companies.company_name IS 'Full name of the company.';
COMMENT ON COLUMN companies.industry IS 'Industry classification.';
COMMENT ON COLUMN companies.sector IS 'Sector classification.';

-- Trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to companies table
CREATE TRIGGER set_timestamp_companies
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;


-- Table: income_statements
CREATE TABLE income_statements (
    ticker TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    report_date DATE,
    revenue NUMERIC,
    cost_of_revenue NUMERIC,
    gross_profit NUMERIC,
    operating_expenses NUMERIC,
    selling_general_administrative NUMERIC,
    research_development NUMERIC,
    depreciation_amortization NUMERIC,
    operating_income_loss NUMERIC,
    non_operating_income_loss NUMERIC,
    interest_expense_net NUMERIC,
    pretax_income_loss_adj NUMERIC,
    abnormal_gains_losses NUMERIC,
    pretax_income_loss NUMERIC,
    income_tax_expense_benefit_net NUMERIC,
    income_loss_from_continuing_operations NUMERIC,
    net_extraordinary_gains_losses NUMERIC,
    net_income NUMERIC,
    net_income_common NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Constraints
    PRIMARY KEY (ticker, fiscal_year),
    FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE
);

COMMENT ON TABLE income_statements IS 'Stores annual income statement data for companies.';
COMMENT ON COLUMN income_statements.ticker IS 'Stock ticker symbol (Foreign Key to companies.ticker).';
COMMENT ON COLUMN income_statements.fiscal_year IS 'The fiscal year the statement pertains to.';
COMMENT ON COLUMN income_statements.report_date IS 'The specific date the report was filed or represents.';

-- Apply trigger to income_statements table
CREATE TRIGGER set_timestamp_income_statements
BEFORE UPDATE ON income_statements
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS for income_statements
ALTER TABLE income_statements ENABLE ROW LEVEL SECURITY;

-- Table: balance_sheets
CREATE TABLE balance_sheets (
    ticker TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    report_date DATE,
    cash_cash_equivalents_short_term_investments NUMERIC,
    accounts_notes_receivable NUMERIC,
    inventories NUMERIC,
    total_current_assets NUMERIC,
    property_plant_equipment_net NUMERIC,
    long_term_investments_receivables NUMERIC,
    other_long_term_assets NUMERIC,
    total_noncurrent_assets NUMERIC,
    total_assets NUMERIC,
    payables_accruals NUMERIC,
    short_term_debt NUMERIC,
    total_current_liabilities NUMERIC,
    long_term_debt NUMERIC,
    total_noncurrent_liabilities NUMERIC,
    total_liabilities NUMERIC,
    share_capital_additional_paid_in_capital NUMERIC,
    treasury_stock NUMERIC,
    retained_earnings NUMERIC,
    total_equity NUMERIC,
    total_liabilities_equity NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Constraints
    PRIMARY KEY (ticker, fiscal_year),
    FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE
);

COMMENT ON TABLE balance_sheets IS 'Stores annual balance sheet data for companies.';
COMMENT ON COLUMN balance_sheets.ticker IS 'Stock ticker symbol (Foreign Key to companies.ticker).';
COMMENT ON COLUMN balance_sheets.fiscal_year IS 'The fiscal year the balance sheet pertains to.';
COMMENT ON COLUMN balance_sheets.report_date IS 'The specific date the report represents (balance sheet is a snapshot).';

-- Apply trigger to balance_sheets table
CREATE TRIGGER set_timestamp_balance_sheets
BEFORE UPDATE ON balance_sheets
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable RLS for balance_sheets
ALTER TABLE balance_sheets ENABLE ROW LEVEL SECURITY;

-- Indexes (Add more based on query needs)
CREATE INDEX idx_income_statements_ticker_year ON income_statements (ticker, fiscal_year);
CREATE INDEX idx_balance_sheets_ticker_year ON balance_sheets (ticker, fiscal_year);
CREATE INDEX idx_companies_industry ON companies (industry);
CREATE INDEX idx_companies_sector ON companies (sector);


COMMIT; 