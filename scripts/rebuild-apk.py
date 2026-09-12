#!/usr/bin/env python3
import os
import zipfile
import hashlib
import base64
import subprocess
import shutil

def sha256_b64(data: bytes) -> str:
    return base64.b64encode(hashlib.sha256(data).digest()).decode("ascii")

def main():
    print("=== Rebuilding 100% Native Signed Android APK for CSU Mitra ===")
    work_dir = "/tmp/csu_apk_rebuild"
    shutil.rmtree(work_dir, ignore_errors=True)
    os.makedirs(work_dir, exist_ok=True)

    source_apk = "public/csu-mitra.apk"
    extract_dir = os.path.join(work_dir, "extracted")
    os.makedirs(extract_dir, exist_ok=True)

    with zipfile.ZipFile(source_apk, "r") as z:
        z.extractall(extract_dir)

    # 1. Update launcher icons with new Samskrit Bharat logo
    icon_192 = "public/icon-192.png"
    icon_512 = "public/icon-512.png"

    icon_paths = [
        "res/mipmap-hdpi-v4/ic_launcher.png",
        "res/mipmap-mdpi-v4/ic_launcher.png",
        "res/mipmap-xhdpi-v4/ic_launcher.png",
        "res/mipmap-xxhdpi-v4/ic_launcher.png",
    ]
    for p in icon_paths:
        dest = os.path.join(extract_dir, p)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copyfile(icon_192, dest)
        print(f"Updated {p} with 192x192 Samskrit Bharat logo")

    dest_512 = os.path.join(extract_dir, "res/mipmap-xxxhdpi-v4/ic_launcher.png")
    os.makedirs(os.path.dirname(dest_512), exist_ok=True)
    shutil.copyfile(icon_512, dest_512)
    print("Updated res/mipmap-xxxhdpi-v4/ic_launcher.png with 512x512 Samskrit Bharat logo")

    # 2. Update classes.dex URL to current URL if found
    classes_dex_path = os.path.join(extract_dir, "classes.dex")
    with open(classes_dex_path, "rb") as f:
        dex_data = f.read()

    old_url = b"https://ais-pre-pckf65baxqyztdy3gsb2to-934728614081.asia-southeast1.run.app"
    new_url = b"https://ais-pre-3uoo7exolfbxhw43mwoy45-934728614081.asia-southeast1.run.app"
    if old_url in dex_data:
        dex_data = dex_data.replace(old_url, new_url)
        # Fix dex checksum / signature if needed or keep standard
        # Dalvik DEX header: bytes 8-11 is Adler32 checksum, bytes 12-31 is SHA1
        # Let's recompute DEX header checksum & SHA-1
        import zlib
        sha1_hash = hashlib.sha1(dex_data[32:]).digest()
        dex_data = dex_data[:12] + sha1_hash + dex_data[32:]
        adler = zlib.adler32(dex_data[12:]) & 0xffffffff
        import struct
        dex_data = dex_data[:8] + struct.pack("<I", adler) + dex_data[12:]
        with open(classes_dex_path, "wb") as f:
            f.write(dex_data)
        print("Updated classes.dex target URL and recomputed DEX checksum & SHA-1")

    # Remove old signature files
    meta_dir = os.path.join(extract_dir, "META-INF")
    shutil.rmtree(meta_dir, ignore_errors=True)
    os.makedirs(meta_dir, exist_ok=True)

    # 3. Build MANIFEST.MF
    manifest_entries = []
    file_list = []
    for root, _, files in os.walk(extract_dir):
        for file in sorted(files):
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, extract_dir)
            if rel_path.startswith("META-INF"):
                continue
            file_list.append(rel_path)

    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: 1.0 (Android)",
        ""
    ]

    manifest_entry_digests = {}
    for rel_path in sorted(file_list):
        full_path = os.path.join(extract_dir, rel_path)
        with open(full_path, "rb") as f:
            content = f.read()
        digest = sha256_b64(content)
        entry_block = f"Name: {rel_path}\r\nSHA-256-Digest: {digest}\r\n\r\n"
        manifest_lines.append(f"Name: {rel_path}")
        manifest_lines.append(f"SHA-256-Digest: {digest}")
        manifest_lines.append("")
        # Digest of the entry itself in MANIFEST.MF for CERT.SF
        manifest_entry_digests[rel_path] = sha256_b64(entry_block.encode("utf-8"))

    manifest_content = "\r\n".join(manifest_lines) + "\r\n"
    manifest_path = os.path.join(meta_dir, "MANIFEST.MF")
    with open(manifest_path, "wb") as f:
        f.write(manifest_content.encode("utf-8"))
    print("Generated META-INF/MANIFEST.MF")

    # 4. Build CERT.SF
    manifest_digest = sha256_b64(manifest_content.encode("utf-8"))
    cert_sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Android)",
        f"SHA-256-Digest-Manifest: {manifest_digest}",
        ""
    ]
    for rel_path in sorted(file_list):
        entry_digest = manifest_entry_digests[rel_path]
        cert_sf_lines.append(f"Name: {rel_path}")
        cert_sf_lines.append(f"SHA-256-Digest: {entry_digest}")
        cert_sf_lines.append("")

    cert_sf_content = "\r\n".join(cert_sf_lines) + "\r\n"
    cert_sf_path = os.path.join(meta_dir, "CERT.SF")
    with open(cert_sf_path, "wb") as f:
        f.write(cert_sf_content.encode("utf-8"))
    print("Generated META-INF/CERT.SF")

    # 5. Sign CERT.SF to create CERT.RSA using OpenSSL CMS PKCS#7
    key_pem = os.path.join(work_dir, "key.pem")
    cert_pem = os.path.join(work_dir, "cert.pem")
    subprocess.run([
        "openssl", "req", "-x509", "-newkey", "rsa:2048",
        "-keyout", key_pem, "-out", cert_pem,
        "-days", "10000", "-nodes",
        "-subj", "/CN=CSU Mitra/OU=IT/O=Central Sanskrit University/C=IN"
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    cert_rsa_path = os.path.join(meta_dir, "CERT.RSA")
    subprocess.run([
        "openssl", "cms", "-sign",
        "-in", cert_sf_path,
        "-out", cert_rsa_path,
        "-outform", "DER",
        "-inkey", key_pem,
        "-signer", cert_pem,
        "-binary", "-noattr"
    ], check=True)
    print("Generated and signed META-INF/CERT.RSA")

    # 6. Repackage into final APK
    final_apk = "public/csu-mitra.apk"
    temp_apk = os.path.join(work_dir, "output.apk")
    with zipfile.ZipFile(temp_apk, "w", compression=zipfile.ZIP_DEFLATED) as out_zip:
        # According to Android APK specs, MANIFEST.MF and signature files first or standard
        out_zip.write(manifest_path, "META-INF/MANIFEST.MF")
        out_zip.write(cert_sf_path, "META-INF/CERT.SF")
        out_zip.write(cert_rsa_path, "META-INF/CERT.RSA")
        for rel_path in sorted(file_list):
            full_path = os.path.join(extract_dir, rel_path)
            # Store uncompressed for resources.arsc and classes.dex if standard, or deflated
            compress_type = zipfile.ZIP_STORED if rel_path.endswith(".arsc") else zipfile.ZIP_DEFLATED
            out_zip.write(full_path, rel_path, compress_type=compress_type)

    shutil.copyfile(temp_apk, final_apk)
    size_kb = os.path.getsize(final_apk) / 1024
    print(f"=== Successfully built Signed CSU Mitra APK ({size_kb:.1f} KB) at {final_apk}! ===")

if __name__ == "__main__":
    main()
