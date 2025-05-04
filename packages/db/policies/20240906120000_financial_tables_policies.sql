-- Policies for financial tables: companies, income_statements, balance_sheets
-- Policy: Allow authenticated users to read all data.

BEGIN;

-- Policies for companies table
DROP POLICY IF EXISTS select_companies_policy ON companies;
CREATE POLICY select_companies_policy
    ON companies
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policies for income_statements table
DROP POLICY IF EXISTS select_income_statements_policy ON income_statements;
CREATE POLICY select_income_statements_policy
    ON income_statements
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policies for balance_sheets table
DROP POLICY IF EXISTS select_balance_sheets_policy ON balance_sheets;
CREATE POLICY select_balance_sheets_policy
    ON balance_sheets
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Note: Insert, Update, Delete policies are not defined here.
-- Add them as needed based on application requirements, potentially
-- restricting write access to specific service roles.

COMMIT; 