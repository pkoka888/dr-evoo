#!/usr/bin/env python3
import os
import sys
import socket
import ssl
from datetime import datetime
import urllib.request
import json


def check_db():
    print("🐘 Checking Database Connection...")
    try:
        from django.db import connections

        conn = connections["default"]
        conn.cursor()
        print("   ✅ Database: CONNECTED (PostgreSQL)")
    except Exception as e:
        print(f"   ❌ Database: FAILED - {e}")
        return False
    return True


def check_redis():
    print("🔴 Checking Redis Connection...")
    try:
        import redis

        redis_url = os.environ.get("REDIS_URL", "redis://redis:6379/0")
        r = redis.from_url(redis_url)
        r.ping()
        print("   ✅ Redis: CONNECTED")
    except Exception as e:
        print(f"   ❌ Redis: FAILED - {e}")
        return False
    return True


def check_czech_settings():
    print("🇨🇿 Checking Czech Localization...")
    from django.conf import settings

    currency = getattr(settings, "DEFAULT_CURRENCY", "N/A")
    country = getattr(settings, "DEFAULT_COUNTRY", "N/A")

    if currency == "CZK":
        print(f"   ✅ Currency: {currency}")
    else:
        print(f"   ⚠️  Currency: {currency} (Expected CZK)")

    if country == "CZ":
        print(f"   ✅ Country: {country}")
    else:
        print(f"   ⚠️  Country: {country} (Expected CZ)")


def check_graphql():
    print("🔗 Checking GraphQL API...")
    try:
        url = os.environ.get("ALLOWED_CLIENT_HOSTS", "http://localhost:8000")
        if "http" not in url:
            url = f"http://localhost:8000"
        else:
            url = url.split(",")[0]

        req = urllib.request.Request(
            f"{url}/graphql/",
            data=b'{"query": "{ __schema { types { name } } }"}',
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read())
            if "data" in data:
                print("   ✅ GraphQL: RESPONDING")
                return True
    except Exception as e:
        print(f"   ⚠️  GraphQL: {e}")
        return False
    return False


def check_ssl(domain):
    print(f"🔒 Checking SSL for {domain}...")
    context = ssl.create_default_context()
    try:
        with socket.create_connection((domain, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                expiry_str = cert.get("notAfter")
                expiry_date = datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z")
                days_left = (expiry_date - datetime.now()).days
                print(f"   ✅ SSL: VALID (Expires in {days_left} days)")
                return True
    except Exception as e:
        print(f"   ⚠️  SSL: {e}")
        return False


def check_baselinker():
    print("📦 Checking BaseLinker Integration...")
    baselinker_token = os.environ.get("BASELINKER_API_KEY")
    if not baselinker_token:
        print("   ℹ️  BaseLinker: Not configured (skip)")
        return True

    try:
        import requests

        response = requests.post(
            "https://api.baselinker.com/connector.php",
            json={
                "token": baselinker_token,
                "method": "getOrders",
                "parameters": {"date_from": datetime.now().timestamp() - 3600},
            },
            timeout=10,
        )
        if response.status_code == 200:
            print("   ✅ BaseLinker: CONNECTED")
            return True
    except Exception as e:
        print(f"   ⚠️  BaseLinker: {e}")
        return False
    return True


if __name__ == "__main__":
    import django

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "saleor.settings")
    django.setup()

    print("=" * 40)
    print("🇨🇿 Saleor Sanity Check - Czech Market")
    print("=" * 40)

    db_ok = check_db()
    redis_ok = check_redis()
    check_czech_settings()
    check_graphql()

    if os.environ.get("ALLOWED_CLIENT_HOSTS"):
        domains = os.environ.get("ALLOWED_CLIENT_HOSTS").split(",")
        for domain in domains:
            domain = domain.strip().replace("https://", "").replace("http://", "")
            if domain and "." in domain:
                check_ssl(domain)

    check_baselinker()

    print("=" * 40)

    if db_ok and redis_ok:
        print("✅ All critical checks passed!")
        sys.exit(0)
    else:
        print("❌ Some checks failed!")
        sys.exit(1)
