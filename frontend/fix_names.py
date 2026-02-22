import os
import shutil

def fix(path):
    for item in os.listdir(path):
        full = os.path.join(path, item)
        print(f"Checking: {repr(item)}")
        if item.startswith('[[') and item.endswith(']]'):
            new_item = item[1:-1] # Remove outer brackets
            new_full = os.path.join(path, new_item)
            print(f"Renaming {repr(item)} to {repr(new_item)}")
            if os.path.exists(new_full):
                if os.path.isdir(new_full):
                    shutil.rmtree(new_full)
                else:
                    os.remove(new_full)
            os.rename(full, new_full)
        elif os.path.isdir(full):
            fix(full)

if __name__ == "__main__":
    fix(r"C:\repositorios\momcar\moncar\frontend\app")
