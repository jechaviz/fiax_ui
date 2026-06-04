import argparse
import shutil
from pathlib import Path


SRC_ROOT = Path(r"C:\git\customers\yo\odoo_yo\data\app_ui_unocss")
DEST_ROOT = Path(r"C:\git\customers\yo\fiax")

DIRS_TO_SYNC = [
    (SRC_ROOT / "components" / "app" / "datatable", DEST_ROOT / "components" / "app" / "datatable"),
    (SRC_ROOT / "components" / "app" / "primitives", DEST_ROOT / "components" / "app" / "primitives"),
]

FILES_TO_SYNC = [
    (SRC_ROOT / "js" / "app_ui_datatable_schema.js", DEST_ROOT / "js" / "fiax_datatable_schema.js"),
    (SRC_ROOT / "js" / "app_ui_datatable_filters.js", DEST_ROOT / "js" / "fiax_datatable_filters.js"),
    (SRC_ROOT / "js" / "app_ui_datatable_views.js", DEST_ROOT / "js" / "fiax_datatable_views.js"),
]


def is_inside(path: Path, root: Path) -> bool:
    return path.resolve().is_relative_to(root.resolve())


def copy_dir(src: Path, dest: Path, *, apply: bool, replace: bool) -> None:
    if not src.exists():
        print(f"skip missing dir: {src}")
        return
    if not is_inside(dest, DEST_ROOT):
        raise ValueError(f"refusing to write outside destination root: {dest}")

    action = "replace" if replace else "merge"
    print(f"{action} dir: {src} -> {dest}")
    if not apply:
        return

    if replace and dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest, dirs_exist_ok=True)


def copy_file(src: Path, dest: Path, *, apply: bool) -> None:
    if not src.exists():
        print(f"skip missing file: {src}")
        return
    if not is_inside(dest, DEST_ROOT):
        raise ValueError(f"refusing to write outside destination root: {dest}")

    print(f"copy file: {src} -> {dest}")
    if not apply:
        return

    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def main() -> None:
    parser = argparse.ArgumentParser(description="Synchronize shared UI assets into Fiax.")
    parser.add_argument("--apply", action="store_true", help="perform the copy; default is dry-run")
    parser.add_argument("--replace", action="store_true", help="replace synced directories instead of merging")
    args = parser.parse_args()

    if not args.apply:
        print("dry-run only; pass --apply to copy files")

    for src, dest in DIRS_TO_SYNC:
        copy_dir(src, dest, apply=args.apply, replace=args.replace)
    for src, dest in FILES_TO_SYNC:
        copy_file(src, dest, apply=args.apply)

    print("sync completed" if args.apply else "dry-run completed")


if __name__ == "__main__":
    main()
