import httpx

TELEGRAM_API = "https://api.telegram.org/bot{token}/sendMessage"


async def send_message(bot_token: str, chat_id: str, text: str) -> dict:
    url = TELEGRAM_API.format(token=bot_token)
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.post(url, json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
        })
        return r.json()


def fmt_vnd(amount: float) -> str:
    return f"{int(amount):,}đ".replace(",", ".")
