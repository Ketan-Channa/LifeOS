import os
import joblib
import json
from datetime import datetime
from typing import Dict, Any, Optional

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

class ModelRegistry:
  @staticmethod
  def get_model_path(model_name: str) -> str:
    return os.path.join(MODELS_DIR, f"{model_name}.joblib")

  @staticmethod
  def get_meta_path(model_name: str) -> str:
    return os.path.join(MODELS_DIR, f"{model_name}_meta.json")

  @staticmethod
  def save_model(model_name: str, pipeline: Any, metadata: Dict[str, Any]):
    model_path = ModelRegistry.get_model_path(model_name)
    meta_path = ModelRegistry.get_meta_path(model_name)

    metadata['trainedAt'] = datetime.utcnow().isoformat()
    
    joblib.dump(pipeline, model_path)
    with open(meta_path, 'w') as f:
      json.dump(metadata, f, indent=2)

  @staticmethod
  def load_model(model_name: str) -> Optional[Any]:
    model_path = ModelRegistry.get_model_path(model_name)
    if os.path.exists(model_path):
      try:
        return joblib.load(model_path)
      except Exception as e:
        print(f"Error loading model {model_name}: {e}")
        return None
    return None

  @staticmethod
  def load_metadata(model_name: str) -> Optional[Dict[str, Any]]:
    meta_path = ModelRegistry.get_meta_path(model_name)
    if os.path.exists(meta_path):
      try:
        with open(meta_path, 'r') as f:
          return json.load(f)
      except Exception:
        return None
    return None

  @staticmethod
  def list_models() -> Dict[str, Any]:
    models = {}
    if os.path.exists(MODELS_DIR):
      for f in os.listdir(MODELS_DIR):
        if f.endswith('_meta.json'):
          name = f.replace('_meta.json', '')
          meta = ModelRegistry.load_metadata(name)
          if meta:
            models[name] = meta
    return models
