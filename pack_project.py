import os
import zipfile

# Files and directories to exclude from the project archive
EXCLUDE_DIRS = {
    'node_modules',
    'dist',
    '.git',
    '.vscode',
    '__pycache__',
    'build',
    'coverage'
}

EXCLUDE_FILES = {
    'freela-project.zip',
    'pack_project.py',
    'bun.lock',
    '.DS_Store'
}

def should_include(rel_path):
    parts = rel_path.split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return False
        if part.startswith('.') and part not in {'.env.example', '.gitignore'}:
            return False
    filename = os.path.basename(rel_path)
    if filename in EXCLUDE_FILES or filename.endswith('.zip') or filename.endswith('.log'):
        return False
    return True

def make_zip(output_path):
    root_dir = '.'
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not (d.startswith('.') and d not in {'.env.example'})]
            
            for file in sorted(files):
                full_path = os.path.join(root, file)
                rel_path = os.path.normpath(os.path.relpath(full_path, root_dir))
                
                if should_include(rel_path):
                    # Store with prefix freela/ for neat unpacking
                    archive_path = os.path.join('freela', rel_path)
                    print(f"Adding: {rel_path} -> {archive_path}")
                    zipf.write(full_path, archive_path)

if __name__ == '__main__':
    output_public = os.path.join('public', 'freela-project.zip')
    output_root = 'freela-project.zip'
    
    os.makedirs('public', exist_ok=True)
    make_zip(output_public)
    
    # Also copy to root
    import shutil
    shutil.copyfile(output_public, output_root)
    
    size_mb = os.path.getsize(output_public) / 1024
    print(f"\nSuccessfully created {output_public} and {output_root} ({size_mb:.1f} KB)")
