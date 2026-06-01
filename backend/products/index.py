"""
API товаров маркетплейса Продажник.
GET  /?action=list           — все активные товары (фильтры: search, category)
GET  /?action=my             — мои товары (продавец)
POST /?action=create         — добавить товар
POST /?action=update&id=N    — обновить товар
POST /?action=delete&id=N    — деактивировать товар
"""
import json
import os
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


def get_user(cur, session_id: str | None):
    if not session_id:
        return None
    cur.execute(
        f"""SELECT u.id, u.name, u.role, u.shop_name
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {"id": row[0], "name": row[1], "role": row[2], "shop_name": row[3]}


def ok(data) -> dict:
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg: str, code: int = 400) -> dict:
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"error": msg}, ensure_ascii=False)}


def row_to_product(row) -> dict:
    return {
        "id": row[0], "seller_id": row[1], "name": row[2], "price": row[3],
        "oldPrice": row[4], "discount": row[5], "brand": row[6], "category": row[7],
        "description": row[8], "image": row[9], "isHit": row[10],
        "rating": float(row[11]), "reviews": row[12],
        "seller_name": row[13], "shop_name": row[14],
        "created_at": str(row[15]),
        "isNew": True,
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "list")

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    if not action:
        action = body.get("action", "list")

    conn = get_conn()
    cur = conn.cursor()

    try:
        session_id = get_session_id(event)
        user = get_user(cur, session_id)

        # === LIST ===
        if action == "list":
            search = qs.get("search", "")
            category = qs.get("category", "")
            limit = int(qs.get("limit", "100"))

            where = ["p.is_active = TRUE"]
            params = []
            if search:
                where.append("(p.name ILIKE %s OR p.brand ILIKE %s)")
                params += [f"%{search}%", f"%{search}%"]
            if category:
                where.append("p.category = %s")
                params.append(category)

            where_sql = " AND ".join(where)
            cur.execute(
                f"""SELECT p.id, p.seller_id, p.name, p.price, p.old_price, p.discount,
                           p.brand, p.category, p.description, p.image_url, p.is_hit,
                           p.rating, p.reviews_count, u.name, u.shop_name, p.created_at
                    FROM {SCHEMA}.products p
                    JOIN {SCHEMA}.users u ON u.id = p.seller_id
                    WHERE {where_sql}
                    ORDER BY p.created_at DESC
                    LIMIT %s""",
                params + [limit]
            )
            return ok([row_to_product(r) for r in cur.fetchall()])

        # === MY ===
        if action == "my":
            if not user:
                return err("Не авторизован", 401)
            cur.execute(
                f"""SELECT p.id, p.seller_id, p.name, p.price, p.old_price, p.discount,
                           p.brand, p.category, p.description, p.image_url, p.is_hit,
                           p.rating, p.reviews_count, u.name, u.shop_name, p.created_at
                    FROM {SCHEMA}.products p
                    JOIN {SCHEMA}.users u ON u.id = p.seller_id
                    WHERE p.seller_id = %s
                    ORDER BY p.created_at DESC""",
                (user["id"],)
            )
            return ok([row_to_product(r) for r in cur.fetchall()])

        # === CREATE ===
        if action == "create" and method == "POST":
            if not user:
                return err("Не авторизован", 401)
            if user["role"] != "seller":
                return err("Только продавцы могут добавлять товары", 403)

            name = (body.get("name") or "").strip()
            price = body.get("price")
            if not name or not price:
                return err("Название и цена обязательны")

            cur.execute(
                f"""INSERT INTO {SCHEMA}.products
                    (seller_id, name, price, old_price, discount, brand, category, description, image_url)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (
                    user["id"], name, int(price),
                    int(body.get("old_price") or 0),
                    int(body.get("discount") or 0),
                    (body.get("brand") or user.get("shop_name") or "Мой магазин").strip(),
                    body.get("category", "Электроника"),
                    (body.get("description") or "").strip(),
                    (body.get("image_url") or "").strip(),
                )
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return ok({"id": new_id, "ok": True})

        # === UPDATE ===
        if action == "update" and method == "POST":
            if not user:
                return err("Не авторизован", 401)
            product_id = int(qs.get("id") or body.get("id") or 0)
            if not product_id:
                return err("Не указан id товара")
            cur.execute(f"SELECT seller_id FROM {SCHEMA}.products WHERE id=%s", (product_id,))
            row = cur.fetchone()
            if not row:
                return err("Товар не найден", 404)
            if row[0] != user["id"]:
                return err("Нет доступа", 403)

            fields, params = [], []
            for key in ("name", "price", "old_price", "discount", "brand", "category", "description", "image_url"):
                if key in body:
                    fields.append(f"{key}=%s")
                    params.append(body[key])
            if fields:
                params.append(product_id)
                cur.execute(f"UPDATE {SCHEMA}.products SET {','.join(fields)} WHERE id=%s", params)
                conn.commit()
            return ok({"ok": True})

        # === DELETE ===
        if action == "delete" and method == "POST":
            if not user:
                return err("Не авторизован", 401)
            product_id = int(qs.get("id") or body.get("id") or 0)
            if not product_id:
                return err("Не указан id товара")
            cur.execute(f"SELECT seller_id FROM {SCHEMA}.products WHERE id=%s", (product_id,))
            row = cur.fetchone()
            if not row:
                return err("Товар не найден", 404)
            if row[0] != user["id"]:
                return err("Нет доступа", 403)
            cur.execute(f"UPDATE {SCHEMA}.products SET is_active=FALSE WHERE id=%s", (product_id,))
            conn.commit()
            return ok({"ok": True})

        return err("Неизвестное действие", 400)

    finally:
        cur.close()
        conn.close()
