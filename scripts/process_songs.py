import os
import re
import json
import pypdf

# Paths
SONGS_DIR = "/Users/ilanavigdor/Documents/GitHub/RhymeTime/public/songs"
MANIFEST_PATH = "/Users/ilanavigdor/Documents/GitHub/RhymeTime/public/songs_manifest.json"

# Helper to generate a simple ID from Hebrew/English titles
def generate_id(title):
    # Map common Hebrew letters to English sound-alike or just keep simple Hebrew characters
    slug = title.strip().lower()
    slug = re.sub(r'[^a-zA-Z0-9א-ת\s]', '', slug)
    slug = re.sub(r'\s+', '_', slug)
    return slug

def process_pdfs():
    if not os.path.exists(SONGS_DIR):
        print(f"Directory {SONGS_DIR} does not exist.")
        return

    # Load existing manifest
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            try:
                manifest = json.load(f)
            except Exception:
                manifest = []
    else:
        manifest = []

    existing_ids = {song['id'] for song in manifest}

    # Find all PDFs in the songs directory
    pdf_files = [f for f in os.listdir(SONGS_DIR) if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF files found in songs directory.")
        return

    print(f"Found {len(pdf_files)} PDF file(s) to process.")

    for pdf_name in pdf_files:
        pdf_path = os.path.join(SONGS_DIR, pdf_name)
        
        # Parse filename pattern: "שירונט - [שם השיר] - [שם המבצע] - הדפסה.pdf"
        match = re.match(r'שירונט\s*-\s*(.+?)\s*-\s*(.+?)\s*-\s*הדפסה\.pdf', pdf_name)
        if match:
            title = match.group(1).strip()
            artist = match.group(2).strip()
        else:
            # Fallback if filename is different
            name_no_ext = os.path.splitext(pdf_name)[0]
            parts = name_no_ext.split('-')
            if len(parts) >= 2:
                title = parts[0].strip()
                artist = parts[1].strip()
            else:
                title = name_no_ext
                artist = "Unknown"

        song_id = generate_id(title)
        txt_filename = f"{song_id}.txt"
        txt_path = os.path.join(SONGS_DIR, txt_filename)

        print(f"\nProcessing: {pdf_name}")
        print(f"  Deduced Title: {title}")
        print(f"  Deduced Artist: {artist}")
        print(f"  Target ID: {song_id}")

        # Extract text from PDF
        try:
            reader = pypdf.PdfReader(pdf_path)
            lyrics_lines = []
            
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    lyrics_lines.append(text)
            
            full_lyrics = "\n".join(lyrics_lines)
            
            # Clean up headers/footers commonly found on Shironet printouts
            cleaned_lines = []
            for line in full_lyrics.split('\n'):
                line_str = line.strip()
                # Skip known header/footer lines if they repeat title/artist or say "הדפסה" or "מילים ולחן"
                if not line_str:
                    cleaned_lines.append("")
                    continue
                if line_str == title or line_str == artist:
                    continue
                if "מילים ולחן:" in line_str or "מילים:" in line_str or "לחן:" in line_str:
                    continue
                if "כל הזכויות שמורות" in line_str or "shironet" in line_str or "mako.co.il" in line_str:
                    continue
                cleaned_lines.append(line_str)
            
            # Reconstruct and clean up duplicate blank lines
            cleaned_text = "\n".join(cleaned_lines).strip()
            cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)

            # Write text file
            with open(txt_path, 'w', encoding='utf-8') as txt_file:
                txt_file.write(cleaned_text)
            print(f"  [Saved TXT] -> {txt_filename}")

            # Add to manifest if not already exists
            if song_id not in existing_ids:
                new_song = {
                    "id": song_id,
                    "title": title,
                    "artist": artist,
                    "language": "Hebrew",
                    "rhymes": []
                }
                manifest.append(new_song)
                existing_ids.add(song_id)
                print(f"  [Added to Manifest] -> {song_id}")
            else:
                print(f"  [Skipped Manifest] -> {song_id} already exists")

        except Exception as e:
            print(f"  Error processing {pdf_name}: {e}")

    # Write updated manifest
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("\nManifest update completed successfully.")

if __name__ == "__main__":
    process_pdfs()
