"""Build distributable skill folders without private organization profiles."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
SKILLS = (
    ROOT / "skills/business/public-bid-proposal",
    ROOT / "skills/public/md-to-hwpx",
)
EXCLUDED = {"organization-profile.md", "__pycache__", ".DS_Store", "Thumbs.db"}


def main():
    output = ROOT / "downloads"
    output.mkdir(exist_ok=True)
    for skill in SKILLS:
        if not (skill / "SKILL.md").is_file():
            raise FileNotFoundError(skill / "SKILL.md")
        files = [
            file for file in sorted(skill.rglob("*"))
            if file.is_file()
            and not file.is_symlink()
            and not any(part in EXCLUDED for part in file.relative_to(skill).parts)
            and not any(part.startswith(".") for part in file.relative_to(skill).parts)
            and file.suffix not in {".pyc", ".pyo"}
        ]
        with ZipFile(output / (skill.name + ".zip"), "w", ZIP_DEFLATED) as archive:
            for file in files:
                archive.write(file, (Path(skill.name) / file.relative_to(skill)).as_posix())
        print(f"{skill.name}.zip: {len(files)} files")


if __name__ == "__main__":
    main()
