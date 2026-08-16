import sys
import subprocess

args = sys.argv[1:]
new_args = []
for a in args:
    if a.startswith("--target="):
        target = a.split("=")[1]
        if target == "x86_64-pc-windows-gnu":
            new_args.extend(["-target", "x86_64-windows-gnu"])
        else:
            # Fallback for other targets if needed, though unlikely here
            new_args.extend(["-target", target.replace("pc-windows-gnu", "windows-gnu")])
    else:
        new_args.append(a)
new_args.append("-fno-sanitize=undefined")

sys.exit(subprocess.call(["gcc"] + new_args))
