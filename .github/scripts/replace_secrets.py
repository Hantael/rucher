import os
import sys

def replace_in_file(filepath, mapping):
    if not os.path.exists(filepath):
        print(f"Fichier introuvable : {filepath}")
        return False
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    replaced = False
    for placeholder, env_val in mapping.items():
        if placeholder in content:
            if not env_val:
                print(f"Erreur : Le placeholder {placeholder} a été trouvé mais la variable d'environnement est vide ou absente.")
                sys.exit(1)
            content = content.replace(placeholder, env_val)
            replaced = True
            
    if replaced:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Remplacements effectués avec succès dans : {filepath}")
    else:
        print(f"Aucun placeholder trouvé dans : {filepath}")
    return True

def main():
    mapping = {
        "__RUCHER_PHONE_RAW__": os.environ.get("RUCHER_PHONE_RAW"),
        "__RUCHER_PHONE_FORMATTED__": os.environ.get("RUCHER_PHONE_FORMATTED"),
        "__RUCHER_EMAIL__": os.environ.get("RUCHER_EMAIL"),
        "__RUCHER_STREET__": os.environ.get("RUCHER_STREET"),
        "__RUCHER_ZIP__": os.environ.get("RUCHER_ZIP"),
        "__RUCHER_CITY__": os.environ.get("RUCHER_CITY"),
        "__RUCHER_MAPS_QUERY__": os.environ.get("RUCHER_MAPS_QUERY")
    }
    
    workspace = os.getcwd()
    print(f"Exécution du remplacement des secrets dans : {workspace}")
    
    replace_in_file(os.path.join(workspace, "index.html"), mapping)
    replace_in_file(os.path.join(workspace, "js", "app.js"), mapping)
    
if __name__ == "__main__":
    main()
