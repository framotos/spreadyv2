import os
import pandas as pd
import logging
from typing import Dict, Optional, List, Any, Tuple

logger = logging.getLogger(__name__)

class DataService:
    """
    Service for accessing CSV data.
    """
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize the data service.
        
        Args:
            data_dir: Directory containing CSV files
        """
        self.data_dir = data_dir
        self._dataframes: Dict[str, pd.DataFrame] = {}
    
    def get_csv_path(self, filename: str) -> str:
        """
        Get the full path to a CSV file.
        
        Args:
            filename: The CSV filename
            
        Returns:
            The full path to the CSV file
        """
        return os.path.join(self.data_dir, filename)
    
    def load_csv(self, filename: str) -> pd.DataFrame:
        """
        Load a CSV file into a pandas DataFrame.
        
        Args:
            filename: The CSV filename
            
        Returns:
            The loaded DataFrame
            
        Raises:
            FileNotFoundError: If the CSV file doesn't exist
        """
        try:
            file_path = self.get_csv_path(filename)
            logger.info(f"Loading CSV file: {file_path}")
            
            if filename in self._dataframes:
                logger.debug(f"Returning cached DataFrame for {filename}")
                return self._dataframes[filename]
            
            if not os.path.exists(file_path):
                logger.error(f"CSV file not found: {file_path}")
                raise FileNotFoundError(f"CSV file not found: {file_path}")
            
            df = pd.read_csv(file_path)
            self._dataframes[filename] = df
            logger.info(f"Successfully loaded CSV file: {filename} with {len(df)} rows")
            
            return df
        except Exception as e:
            logger.error(f"Error loading CSV file {filename}: {str(e)}", exc_info=True)
            raise
    
    def get_balance_sheet_data(self) -> pd.DataFrame:
        """
        Get balance sheet data.
        
        Returns:
            DataFrame containing balance sheet data
        """
        return self.load_csv("balance_info.csv")
    
    def get_income_statement_data(self) -> pd.DataFrame:
        """
        Get income statement data.
        
        Returns:
            DataFrame containing income statement data
        """
        return self.load_csv("income_info.csv")
    
    def get_combined_financial_data(self) -> pd.DataFrame:
        """
        Get combined financial data (balance sheet and income statement).
        
        Returns:
            DataFrame containing combined financial data
        """
        return self.load_csv("balance_income_info.csv")
    
    def get_available_companies(self) -> List[str]:
        """
        Get a list of available companies.
        
        Returns:
            List of company names/tickers
        """
        df = self.get_combined_financial_data()
        return df["ticker"].unique().tolist()
    
    def get_available_years(self) -> List[int]:
        """
        Get a list of available years.
        
        Returns:
            List of years
        """
        df = self.get_combined_financial_data()
        return sorted(df["fiscal_year"].unique().tolist()) 