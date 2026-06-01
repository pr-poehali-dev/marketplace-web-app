"""
Авторизация и регистрация пользователей маркетплейса Продажник.
GET  /?action=me       — текущий пользователь
POST /?action=register — регистрация
POST /?action=login    — вход
POST /?action=logout   — выход
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = "t_p15421197_marketplace_web_app"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization, X-Cookie",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()


def get_session_id(event: dict) -> str | None:
    auth = (event.get("headers") or {}).get("X-Authorization", "") or ""
    if auth.startswith("Bearer "):
        return auth[7:]
    cookie = (event.get("headers") or {}).get("X-Cookie", "") or ""
    for part in cookie.split(";"):
        part = part.strip()
        if part.startswith("session_id="):
            return part[len("session_id="):]
    return None


def ok(data: dict, cookie: str | None = None) -> dict:
    headers = {**CORS, "Content-Type": "application/json"}
    if cookie:
        headers["X-Set-Cookie"] = cookie
    return {"statusCode": 200, "headers": headers, "body": json.dumps(data, ensure_ascii=False)}


def err(msg: str, code: int = 400) -> dict:
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    # action может быть и в body
    if not action:
        action = body.get("action", "")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # === ME ===
        if action == "me":
            session_id = get_session_id(event)
            if not session_id:
                return err("Не авторизован", 401)
            cur.execute(
                f"""SELECT u.id, u.email, u.name, u.role, u.shop_name, u.shop_description
                    FROM {SCHEMA}.sessions s
                    JOIN {SCHEMA}.users u ON u.id = s.user_id
                    WHERE s.id = %s AND s.expires_at > NOW()""",
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return err("Сессия истекла", 401)
            uid, email, name, role, shop_name, shop_desc = row
            return ok({"user": {"id": uid, "email": email, "name": name, "role": role,
                                "shop_name": shop_name, "shop_description": shop_desc}})

        # === REGISTER ===
        if action == "register" and method == "POST":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""
            name = (body.get("name") or "").strip()
            role = body.get("role", "buyer")
            shop_name = (body.get("shop_name") or "").strip() or None

            if not email or not password or not name:
                return err("Заполните все обязательные поля")
            if len(password) < 6:
                return err("Пароль должен быть минимум 6 символов")
            if role not in ("buyer", "seller"):
                role = "buyer"

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
            if cur.fetchone():
                return err("Пользователь с таким email уже существует")

            pwd_hash = hash_password(password)
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (email, password_hash, name, role, shop_name) VALUES (%s,%s,%s,%s,%s) RETURNING id",
                (email, pwd_hash, name, role, shop_name)
            )
            user_id = cur.fetchone()[0]
            session_id = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (id, user_id) VALUES (%s,%s)", (session_id, user_id))
            conn.commit()
            cookie = f"session_id={session_id}; Path=/; HttpOnly; Max-Age=2592000; SameSite=None; Secure"
            return ok({"user": {"id": user_id, "email": email, "name": name, "role": role,
                                "shop_name": shop_name}, "session_id": session_id}, cookie)

        # === LOGIN ===
        if action == "login" and method == "POST":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""
            if not email or not password:
                return err("Введите email и пароль")

            pwd_hash = hash_password(password)
            cur.execute(
                f"""SELECT id, email, name, role, shop_name, shop_description
                    FROM {SCHEMA}.users WHERE email=%s AND password_hash=%s""",
                (email, pwd_hash)
            )
            row = cur.fetchone()
            if not row:
                return err("Неверный email или пароль")

            uid, email, name, role, shop_name, shop_desc = row
            session_id = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (id, user_id) VALUES (%s,%s)", (session_id, uid))
            conn.commit()
            cookie = f"session_id={session_id}; Path=/; HttpOnly; Max-Age=2592000; SameSite=None; Secure"
            return ok({"user": {"id": uid, "email": email, "name": name, "role": role,
                                "shop_name": shop_name, "shop_description": shop_desc},
                       "session_id": session_id}, cookie)

        # === LOGOUT ===
        if action == "logout" and method == "POST":
            session_id = get_session_id(event)
            if session_id:
                cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE id=%s", (session_id,))
                conn.commit()
            cookie = "session_id=; Path=/; Max-Age=0"
            return ok({"ok": True}, cookie)

        return err("Неизвестное действие", 400)

    finally:
        cur.close()
        conn.close()
