"""
File operation utilities for JSON backup storage
"""
import json
from pathlib import Path

def load_json_file(filename: Path) -> dict:
    """Load data from JSON file"""
    if not filename.exists():
        return {}
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_json_file(filename: Path, data: dict):
    """Save data to JSON file"""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2, default=str)