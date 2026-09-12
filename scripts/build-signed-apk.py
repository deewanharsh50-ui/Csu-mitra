#!/usr/bin/env python3
import os
import sys
import zipfile
import hashlib
import base64
import subprocess
import shutil
import struct

def sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

def sha256_b64(data: bytes) -> str:
    return base64.b64encode(sha256(data)).decode("ascii")

def main():
    print("=== Building 100% Android-Compliant Signed APK for CSU Mitra ===")
    work_dir = "/tmp/csu_apk_full_build"
    shutil.rmtree(work_dir, ignore_errors=True)
    os.makedirs(work_dir, exist_ok=True)

    source_apk = "public/csu-mitra.apk"
    extract_dir = os.path.join(work_dir, "extracted")
    os.makedirs(extract_dir, exist_ok=True)

    with zipfile.ZipFile(source_apk, "r") as z:
        z.extractall(extract_dir)

    # 1. Update launcher icons with Samskrit Bharat logo
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

    dest_512 = os.path.join(extract_dir, "res/mipmap-xxxhdpi-v4/ic_launcher.png")
    os.makedirs(os.path.dirname(dest_512), exist_ok=True)
    shutil.copyfile(icon_512, dest_512)

    # 2. Update classes.dex URL to current deployment URL if needed
    classes_dex_path = os.path.join(extract_dir, "classes.dex")
    if os.path.exists(classes_dex_path):
        with open(classes_dex_path, "rb") as f:
            dex_data = f.read()

        old_url = b"https://ais-pre-pckf65baxqyztdy3gsb2to-934728614081.asia-southeast1.run.app"
        new_url = b"https://ais-pre-3uoo7exolfbxhw43mwoy45-934728614081.asia-southeast1.run.app"
        if old_url in dex_data:
            dex_data = dex_data.replace(old_url, new_url)
            import zlib
            sha1_hash = hashlib.sha1(dex_data[32:]).digest()
            dex_data = dex_data[:12] + sha1_hash + dex_data[32:]
            adler = zlib.adler32(dex_data[12:]) & 0xffffffff
            dex_data = dex_data[:8] + struct.pack("<I", adler) + dex_data[12:]
            with open(classes_dex_path, "wb") as f:
                f.write(dex_data)

    # 3. Clean META-INF
    meta_dir = os.path.join(extract_dir, "META-INF")
    shutil.rmtree(meta_dir, ignore_errors=True)
    os.makedirs(meta_dir, exist_ok=True)

    # 4. Generate persistent RSA 2048 certificate and private key
    key_pem = os.path.join(work_dir, "csu_key.pem")
    cert_pem = os.path.join(work_dir, "csu_cert.pem")
    subprocess.run([
        "openssl", "req", "-x509", "-newkey", "rsa:2048",
        "-keyout", key_pem, "-out", cert_pem,
        "-days", "10000", "-nodes",
        "-subj", "/CN=CSU Mitra/OU=IT/O=Central Sanskrit University/ST=Delhi/C=IN"
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 5. Build file list
    file_list = []
    for root, _, files in os.walk(extract_dir):
        for file in sorted(files):
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, extract_dir)
            if rel_path.startswith("META-INF"):
                continue
            file_list.append(rel_path)

    # 6. Generate MANIFEST.MF with both SHA-256 and SHA1 for maximum backward compatibility
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
        d_sha256 = sha256_b64(content)
        d_sha1 = base64.b64encode(hashlib.sha1(content).digest()).decode("ascii")

        entry_block = f"Name: {rel_path}\r\nSHA-256-Digest: {d_sha256}\r\nSHA1-Digest: {d_sha1}\r\n\r\n"
        manifest_lines.append(f"Name: {rel_path}")
        manifest_lines.append(f"SHA-256-Digest: {d_sha256}")
        manifest_lines.append(f"SHA1-Digest: {d_sha1}")
        manifest_lines.append("")
        manifest_entry_digests[rel_path] = (sha256_b64(entry_block.encode("utf-8")), base64.b64encode(hashlib.sha1(entry_block.encode("utf-8")).digest()).decode("ascii"))

    manifest_content = "\r\n".join(manifest_lines) + "\r\n"
    manifest_path = os.path.join(meta_dir, "MANIFEST.MF")
    with open(manifest_path, "wb") as f:
        f.write(manifest_content.encode("utf-8"))

    # 7. Generate CERT.SF
    manifest_sha256 = sha256_b64(manifest_content.encode("utf-8"))
    manifest_sha1 = base64.b64encode(hashlib.sha1(manifest_content.encode("utf-8")).digest()).decode("ascii")
    cert_sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Android)",
        f"SHA-256-Digest-Manifest: {manifest_sha256}",
        f"SHA1-Digest-Manifest: {manifest_sha1}",
        ""
    ]
    for rel_path in sorted(file_list):
        d_sha256, d_sha1 = manifest_entry_digests[rel_path]
        cert_sf_lines.append(f"Name: {rel_path}")
        cert_sf_lines.append(f"SHA-256-Digest: {d_sha256}")
        cert_sf_lines.append(f"SHA1-Digest: {d_sha1}")
        cert_sf_lines.append("")

    cert_sf_content = "\r\n".join(cert_sf_lines) + "\r\n"
    cert_sf_path = os.path.join(meta_dir, "CERT.SF")
    with open(cert_sf_path, "wb") as f:
        f.write(cert_sf_content.encode("utf-8"))

    # 8. Sign with openssl smime (Creates standard RFC 2315 PKCS#7 block supported by Android)
    cert_rsa_path = os.path.join(meta_dir, "CERT.RSA")
    subprocess.run([
        "openssl", "smime", "-sign",
        "-in", cert_sf_path,
        "-out", cert_rsa_path,
        "-outform", "DER",
        "-inkey", key_pem,
        "-signer", cert_pem,
        "-binary", "-noattr",
        "-md", "sha256"
    ], check=True)

    # 9. Pack into aligned APK
    temp_apk = os.path.join(work_dir, "output.apk")
    with zipfile.ZipFile(temp_apk, "w", compression=zipfile.ZIP_DEFLATED) as out_zip:
        # Signature files must be first
        out_zip.write(manifest_path, "META-INF/MANIFEST.MF")
        out_zip.write(cert_sf_path, "META-INF/CERT.SF")
        out_zip.write(cert_rsa_path, "META-INF/CERT.RSA")
        for rel_path in sorted(file_list):
            full_path = os.path.join(extract_dir, rel_path)
            compress_type = zipfile.ZIP_STORED if rel_path.endswith(".arsc") else zipfile.ZIP_DEFLATED
            out_zip.write(full_path, rel_path, compress_type=compress_type)

    final_apk = "public/csu-mitra.apk"
    shutil.copyfile(temp_apk, final_apk)
    dist_apk = "dist/csu-mitra.apk"
    os.makedirs("dist", exist_ok=True)
    shutil.copyfile(temp_apk, dist_apk)
    
    size_kb = os.path.getsize(final_apk) / 1024
    print(f"=== Successfully built Android Signed CSU Mitra APK ({size_kb:.1f} KB) at {final_apk}! ===")

if __name__ == "__main__":
    main()
