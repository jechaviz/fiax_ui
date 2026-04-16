import os
import shutil

src_components = r"C:\git\customers\yo\odoo_yo\data\app_ui_unocss\components\app"
dest_components = r"C:\git\customers\yo\fiax\components\app"

if not os.path.exists(dest_components):
    os.makedirs(dest_components)

# Datatable
src_dt = os.path.join(src_components, "datatable")
dest_dt = os.path.join(dest_components, "datatable")
if os.path.exists(src_dt):
    if os.path.exists(dest_dt): shutil.rmtree(dest_dt)
    shutil.copytree(src_dt, dest_dt)

# Primitives
src_prim = os.path.join(src_components, "primitives")
dest_prim = os.path.join(dest_components, "primitives")
if os.path.exists(src_prim):
    if os.path.exists(dest_prim): shutil.rmtree(dest_prim)
    shutil.copytree(src_prim, dest_prim)

# Scripts
src_scripts = r"C:\git\customers\yo\odoo_yo\data\app_ui_unocss\js"
dest_scripts = r"C:\git\customers\yo\fiax\js"

scripts_to_copy = [
    ("app_ui_datatable_schema.js", "fiax_datatable_schema.js"),
    ("app_ui_datatable_filters.js", "fiax_datatable_filters.js"),
    ("app_ui_datatable_views.js", "fiax_datatable_views.js")
]

for old, new in scripts_to_copy:
    src_f = os.path.join(src_scripts, old)
    dest_f = os.path.join(dest_scripts, new)
    if os.path.exists(src_f):
        shutil.copy2(src_f, dest_f)

print("Copy completed")
