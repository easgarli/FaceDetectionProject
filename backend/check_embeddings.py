import numpy as np

def print_dict_structure(d, level=0, max_level=3):
    """Print the structure of nested dictionaries and arrays"""
    prefix = "  " * level
    if level >= max_level:
        print(f"{prefix}...")
        return
        
    if isinstance(d, dict):
        print(f"{prefix}Dict with {len(d)} keys:")
        for k, v in list(d.items())[:3]:  # Show first 3 items
            print(f"{prefix}Key '{k}':")
            print_dict_structure(v, level + 1, max_level)
        if len(d) > 3:
            print(f"{prefix}... ({len(d)-3} more keys)")
    elif isinstance(d, np.ndarray):
        print(f"{prefix}Array shape: {d.shape}, dtype: {d.dtype}")
    elif isinstance(d, list):
        print(f"{prefix}List of length {len(d)}")
        if len(d) > 0:
            print(f"{prefix}First element type: {type(d[0])}")
    else:
        print(f"{prefix}Type: {type(d)}")

try:
    print("Loading embeddings...")
    embeddings = np.load('embeddings/train_embeddings.pkl', allow_pickle=True)
    print("\nEmbeddings structure:")
    print_dict_structure(embeddings)
    
    print("\nLoading labels...")
    labels = np.load('embeddings/face_recognition_model.pkl', allow_pickle=True)
    print("\nLabels structure:")
    print_dict_structure(labels)
    
except Exception as e:
    print(f"Error loading files: {e}") 