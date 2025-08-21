import pandas as pd
import json
import os
from typing import Dict, Any, Optional
import mimetypes

def get_file_type(filename: str) -> str:
    """Get file type from filename"""
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or "application/octet-stream"

def parse_csv_file(file_path: str) -> Dict[str, Any]:
    """Parse CSV file and return as dictionary"""
    try:
        df = pd.read_csv(file_path)
        return {
            "rows": len(df),
            "columns": list(df.columns),
            "data": df.to_dict(orient="records")
        }
    except Exception as e:
        raise Exception(f"Failed to parse CSV: {str(e)}")

def parse_json_file(file_path: str) -> Dict[str, Any]:
    """Parse JSON file and return as dictionary"""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        return {
            "type": type(data).__name__,
            "data": data
        }
    except Exception as e:
        raise Exception(f"Failed to parse JSON: {str(e)}")

def parse_txt_file(file_path: str) -> Dict[str, Any]:
    """Parse text file and return as dictionary"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {
            "lines": len(content.split('\n')),
            "characters": len(content),
            "content": content[:1000] + "..." if len(content) > 1000 else content
        }
    except Exception as e:
        raise Exception(f"Failed to parse text file: {str(e)}")

def parse_file_by_type(file_path: str, file_type: str) -> Dict[str, Any]:
    """Parse file based on its type"""
    if file_type == "text/csv" or file_path.endswith('.csv'):
        return parse_csv_file(file_path)
    elif file_type == "application/json" or file_path.endswith('.json'):
        return parse_json_file(file_path)
    elif file_type.startswith("text/") or file_path.endswith('.txt'):
        return parse_txt_file(file_path)
    else:
        raise Exception(f"Unsupported file type: {file_type}")
