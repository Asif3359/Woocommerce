## Public Auth Routes (cURL examples)

Base URL: `http://localhost:3000`

Notes:
- Replace emails/passwords as needed.
- You can use either Session (cookies) or JWT (Bearer token).

### Register (common)
```bash
curl -i \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/auth/register \
  -d '{"email":"asifahammednishst@gmail.com","password":"404asif404","name":"Asif Ahammed"}'
```

---

## Session-based (Web)

### Login (stores session cookie)
```bash
curl -i \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

### Me (uses stored cookie)
```bash
curl -i \
  -b cookies.txt \
  http://localhost:3000/api/auth/me
```

### Logout (invalidates session)
```bash
curl -i \
  -b cookies.txt \
  -X POST http://localhost:3000/api/auth/logout
```

---

## JWT-based (Mobile)

### JWT Login (returns accessToken)
```bash
curl -sS -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/auth/jwt-login \
  -d '{"email":"alice@example.com","password":"secret123"}' \
  | jq -r .accessToken > access_token.txt

```

Copy `accessToken` from the response.

### JWT Me (send Bearer token)
```bash


ACCESS_TOKEN="$(tr -d '\n' < access_token.txt)"
curl -i -H "Authorization: Bearer ${ACCESS_TOKEN}" http://localhost:3000/api/auth/jwt-me
```

### Mobile logout
- Delete the stored access token on the device (stateless logout).
- Optionally implement refresh tokens + server-side revoke if needed.

###  Get All Product  
```bash
curl -i http://localhost:3000/api/products
```

69051d0fc0fb5ef7fe5909da
### Get Product by ID
```bash
curl -i http://localhost:3000/api/products/69051d0fc0fb5ef7fe5909da
```