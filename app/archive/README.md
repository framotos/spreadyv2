# Baloise Analytics

## File Structure

```
- /src           # Source code directory
  - app.py         # Main application code
- /notebooks     # Documentation files
- /data          # Data files used by the application
- README.md      # This file
- requirements.txt  # Dependencies
- /venv          # Virtual environment
- .env           # Environment variables
```

## Setup

### Prerequisites

- Python 3.x installed
- Pip package manager

### Installation

1. Clone the repository:

   ```
   git clone https://github.ibm.com/Paul-Roeseler/baloise_analytics
   cd baloise_analytics
   ```

2. Set up a virtual environment (optional but recommended):

   ```
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

### .env Setup

Create a `.env` file in the root directory of your project with the following contents:

```
WATSONX_API=<REPLACE WITH IBM CLOUD API KEY>
WATSONX_URL=<REPLACE WITH WATSONX URL>
WATSONX_PID=<REPLACE WITH WATSONX PROJECT ID>
GCLOUD_PID=<REPLACE WITH GOOGLE CLOUD PROJECT NAME>
GCLOUD_QUERY=<REPLACE WITH BIGQUERY>
GOOGLE_APPLICATION_CREDENTIALS=<REPLACE WITH SERVICE ACCOUNT API JSON PATH>
```

Make sure to replace `<REPLACE WITH ...>` placeholders with your actual credentials.

1. Goto https://cloud.google.com/docs/authentication/provide-credentials-adc#local-dev

2. Install `google-cloud-sdk` from here https://cloud.google.com/sdk/docs/install#mac

   ![alt text](images/image.png)

   Install based on your OS

3. Place `google-cloud-sdk` in `src` folder.

4. Run 

   ```
   ./google-cloud-sdk/install.sh
   ```

5. Run 

   ```
   ./google-cloud-sdk/bin/gcloud init
   ```

   Select appropriate project.

6. Run 

   ```
   ./google-cloud-sdk/bin/gcloud auth application-default login
   ```

7. Create a directory named `graphics` inside `src`

## To run

Provide instructions on how to run your application or scripts.

1. Activate the virtual environment (if used):

   ```
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. Navigate to the source directory:

   ```
   cd src
   ```

3. To Run `flask` application:

   ```
   python app.py
   ```

4. To run `fatsapi` application:

   ```
   uvicorn main:app --reload
   ```