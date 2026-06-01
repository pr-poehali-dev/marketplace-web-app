"""
API заказов маркетплейса Продажник.
POST /?action=create  — создать заказ
GET  /?action=my      — мои заказы (авторизованный пользователь)
GET  /?action=all     — все заказы (для будущей админки)
"""
import json
import os
import random
import string
import psycopg2

SCHEMA = "t_p15421197_marketplace_web_app"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization, X-Cookie",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


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


def get_user_id(cur, session_id: str | None) -> int | None:
    if not session_id:
        return None
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE id = %s AND expires_at > NOW()",
        (session_id,)
    )
    row = cur.fetchone()
    return row[0] if row else None


def gen_order_number() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ПРД-{suffix}"


def ok(data) -> dict:
    return {
        "statusCode": 200,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(data, ensure_ascii=False, default=str),
    }


def err(msg: str, code: int = 400) -> dict:
    return {
        "statusCode": code,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps({"error": msg}, ensure_ascii=False),
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "create" if method == "POST" else "my")

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    conn = get_conn()
    cur = conn.cursor()

    try:
        session_id = get_session_id(event)
        user_id = get_user_id(cur, session_id)

        # === CREATE ===
        if action == "create" and method == "POST":
            buyer_name = (body.get("buyer_name") or "").strip()
            phone = (body.get("phone") or "").strip()
            city = (body.get("city") or "").strip()
            street = (body.get("street") or "").strip()
            house = (body.get("house") or "").strip()
            apartment = (body.get("apartment") or "").strip()
            items = body.get("items") or []
            total_price = body.get("total_price") or 0

            if not buyer_name:
                return err("Укажите имя получателя")
            if not phone:
                return err("Укажите номер телефона")
            if not city or not street or not house:
                return err("Укажите полный адрес доставки")
            if not items:
                return err("Корзина пуста")

            order_number = gen_order_number()
            # Ensure uniqueness
            for _ in range(5):
                cur.execute(
                    f"SELECT 1 FROM {SCHEMA}.orders WHERE order_number = %s",
                    (order_number,)
                )
                if not cur.fetchone():
                    break
                order_number = gen_order_number()

            cur.execute(
                f"""INSERT INTO {SCHEMA}.orders
                    (order_number, buyer_name, phone, city, street, house, apartment,
                     items, total_price, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, order_number, created_at""",
                (
                    order_number, buyer_name, phone, city, street, house, apartment,
                    json.dumps(items, ensure_ascii=False), int(total_price), user_id
                )
            )
            row = cur.fetchone()
            conn.commit()

            return ok({
                "ok": True,
                "order_id": row[0],
                "order_number": row[1],
                "created_at": str(row[2]),
            })

        # === MY ORDERS ===
        if action == "my":
            if not user_id:
                return err("Не авторизован", 401)
            cur.execute(
                f"""SELECT id, order_number, buyer_name, phone, city, street, house,
                           apartment, items, total_price, status, created_at
                    FROM {SCHEMA}.orders
                    WHERE user_id = %s
                    ORDER BY created_at DESC""",
                (user_id,)
            )
            rows = cur.fetchall()
            result = []
            for r in rows:
                result.append({
                    "id": r[0], "order_number": r[1], "buyer_name": r[2],
                    "phone": r[3], "city": r[4], "street": r[5], "house": r[6],
                    "apartment": r[7], "items": r[8], "total_price": r[9],
                    "status": r[10], "created_at": str(r[11]),
                })
            return ok(result)

        return err("Неизвестное действие", 400)

    finally:
        cur.close()
        conn.close()
