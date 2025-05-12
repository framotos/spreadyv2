from setuptools import setup, find_packages

setup(
    name="neurofinance-agents",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "smolagents>=0.1.0",
        "pandas>=1.3.0",
        "plotly>=5.0.0",
        "numpy>=1.20.0",
    ],
    description="Agent implementations and tools for NeuroFinance",
    author="",
    author_email="",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
    ],
    python_requires=">=3.9",
) 