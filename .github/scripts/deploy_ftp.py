import ftplib
import os
import sys

FTP_HOST = os.environ.get("FTP_HOST")
FTP_USER = os.environ.get("FTP_USER")
FTP_PASS = os.environ.get("FTP_PASS")

def main():
    print("Connexion au serveur FTP Infomaniak...")
    if not FTP_HOST or not FTP_USER or not FTP_PASS:
        print("Erreur : Les variables d'environnement FTP_HOST, FTP_USER, et FTP_PASS doivent être définies.")
        sys.exit(1)
        
    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("Connexion réussie !")
    except Exception as e:
        print(f"Erreur de connexion FTP : {e}")
        sys.exit(1)
    
    # Lister les répertoires distants pour identifier où placer les fichiers
    print("\nListe des répertoires distants :")
    files = []
    try:
        ftp.retrlines('NLST', files.append)
    except Exception as e:
        print(f"Erreur lors du listage : {e}")
        
    print("Contenu du répertoire racine FTP :", files)
    
    # Choix du répertoire de destination : 'web' pour Infomaniak s'il existe
    target_dir = '/'
    if 'web' in files:
        target_dir = '/web'
    elif 'public_html' in files:
        target_dir = '/public_html'
        
    print(f"Répertoire cible sélectionné : {target_dir}")
    try:
        ftp.cwd(target_dir)
        print(f"Changement de répertoire vers {target_dir} réussi.")
    except Exception as e:
        print(f"Impossible de changer de répertoire vers {target_dir} : {e}")
        sys.exit(1)
        
    local_dir = os.getcwd()
    
    def upload_file(local_path, remote_path):
        print(f"Téléversement : {local_path} -> {remote_path}")
        try:
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)
        except Exception as e:
            print(f"Erreur lors de l'envoi de {remote_path} : {e}")

    def upload_directory(local_path, remote_path):
        if remote_path:
            try:
                ftp.mkd(remote_path)
                print(f"Création du dossier distant : {remote_path}")
            except ftplib.error_perm as e:
                # Le dossier existe probablement déjà
                pass
            except Exception as e:
                print(f"Erreur création dossier {remote_path} : {e}")
                
        for item in os.listdir(local_path):
            local_item = os.path.join(local_path, item)
            remote_item = f"{remote_path}/{item}" if remote_path else item
            
            # Ignorer les dossiers git, github, et le fichier doc
            if item in ['.git', '.github', 'GEMINI.md', 'README.md']:
                continue
                
            if os.path.isdir(local_item):
                upload_directory(local_item, remote_item)
            else:
                upload_file(local_item, remote_item)
                
    print("\nDébut du téléversement des fichiers...")
    upload_directory(local_dir, '')
    print("\nTéléversement terminé avec succès !")
    ftp.quit()

if __name__ == '__main__':
    main()
