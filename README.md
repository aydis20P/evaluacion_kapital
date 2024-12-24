# API de la evaluación de Kapital

Este proyecto corresponde a la evaluación de reclutamiento de Kapital

## Documentación
Especificación OpenAPI (contratos) disponibles en
[Stoplight](https://willcdmxdev.stoplight.io/docs/kapital/)

## Instalación
Para su comodidad desplegar con docker ;)

```bash
docker-compose up
```

## Consideraciones de cifrado RSA/ECB/OAEPWithSHA-1AndMGF1Padding
* El proyecto está conformado por una API de seguridad y una API de gestión de transacciones.
  - Primero se debe consumir el servicio de /token (API Keys de ejemplo funcionales - U:**Kapital** P:**K@p1t@1pwD3s**) de la API de seguridad para obtener llaves (servicio /llaves) que serán utilizadas para cifrar los cuerpos de entrada de los servicios del API de transacciones.
  - Por ejemplo, para crear una cuenta se deberán obtener las llaves RSA, el idAcceso y enviar el cuerpo cifrado (RSA/ECB/OAEPWithSHA-1AndMGF1Padding) además del idAcceso en el header x-id-acceso y el resto de los headers que se indican en la especificación de OPEN API. Por ejemplo, para crear una cuenta

```bash
POST 127.0.0.1:9000/cuentas

headers:
Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzZhMjY4ZDhkMzViZjZlMTdlNTI3MmQiLCJ1c2VybmFtZSI6IkthcGl0YWwiLCJpYXQiOjE3MzUwMTAzNTEsImV4cCI6MTczNTAxMDY1MX0.p6zUL3GGyiYx-UgvzSvNGKZ5Z676XBBztaR_wBUP4ro
x-id-transaccion:2f04461d-e252-4799-99e5-9fe7bfd06821
x-id-acceso:20241224031404537

request body:
{
    "encryptedData": "VB50GHbFeHOsEi2jUACpz4TPIeyfZqzcZEWuc4D4tQZID/uOnqsfAUAFCBvKiqViNJsM15a1WmP39a6siL8j2IwG8P+MkOeSO6rOivgCCyI+zYearua7Yd1EQHLa/Wh3u+Q63OwHbhqxtS68c3Z6vhEj+LYaJd9w0nfqn6YyXs929YOg7dvm3S/sYqmuezCgN/R+TKJU8iYzkENR2Gy2AS7IywsrmHbW+kvCBNXnJCxfS3JRls6EjRWz5p5a/UvVUWRWYbhhm04wprewG3tn1JWScFQ3KB4W3BwC8RJjSUVljCrQ7U1bW48xB6cQ4jhwAKRIZR+PiQ12/IZ3e8oz1Q=="
}
```
  - Así mismo para descifrar los datos se utilizará la llave complementaria con el mismo tipo de cifrado (RSA/ECB/OAEPWithSHA-1AndMGF1Padding).
  - En el caso de los métodos GET de la API de gestión de transacciones, también es necesario generar llaves, estas serán utilizadas para el cifrado y descifrado de las respuestas.


## Modelo de la BD (colecciones)
A continuación se muestra el modelo de la BD (estructura de los documentos), esta fue pensada por la parte de las transacciones y cuentas como dos colecciones separadas para mantener los documentos desacoplados y no obtener datos innecesarios en cierto escenarios, por ejemplo, al ir por un documento de la colección de cuentas no se obtienen todas las transacciones asociadas, aunque mongodb lo permite, esto mermaría el procesamiento de la data en el BE.

En la colección de credenciales para las API Keys, se almacena el password, como es habitual, hasheado. Esto garantiza la confidencialidad de las credenciales al ser inaccesible incluso para DBAs y Devs; a considerar que en el levantamiento del aplicativo se crean las credenciales por default, esto es únicamente con fines ilustrativos. 

```bash
Ceuntas:

{
  "_id": {
    "$oid": "676910e6f17e7a973261652b"
  },
  "nombre": "Will Palacios",
  "saldoInicial": 123,
  "saldo": 123,
  "__v": 0
}
```

```bash
Transacciones:

{
  "_id": {
    "$oid": "6769dfd79d26be6fd42a9b79"
  },
  "cuentaId": {
    "$oid": "6769bae89e6ae156201b1a47"
  },
  "tipo": "deposito",
  "monto": 500,
  "fecha": {
    "$date": "2024-12-23T22:10:31.783Z"
  },
  "__v": 0
}

{
  "_id": {
    "$oid": "6769e36cbe5efeff1b80bce7"
  },
  "cuentaId": {
    "$oid": "6769bae89e6ae156201b1a47"
  },
  "tipo": "retiro",
  "monto": 623,
  "fecha": {
    "$date": "2024-12-23T22:25:48.393Z"
  },
  "__v": 0
}
```

```bash
Credenciales:

{
  "_id": {
    "$oid": "6768bcf3efcb58ce87d5ca8b"
  },
  "username": "Kapital",
  "password": "$2b$10$5M/LpwWY1xbStJLi.LQUCuy2kyvpVYv.XSBUuStJ91mgoAOZUr0vy",
  "__v": 0
}
```

```bash
Llaves:

{
  "_id": {
    "$oid": "676900a58b6e67f4803261bb"
  },
  "idAcceso": "20241223061813343",
  "llavePublica": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvbfPfN8vWLuXAqVeByYn/Hr62p9CvcPm4OrlF6c2lIZiSlwRPYG5Tv33wF2pu3cVWfEJUUFpWg6+ckpKynBSo/1Qmno8JjaVEmsSDeg0zArp6W8LUIxJtGij3HrIbldKxmlHFrbaH23Xt+JSvjVG4fj9zMfj8drvboJ8BtqJ/NME+vQxJc29ysxBJ4D9mjnkSwKZs3hnNbQAICoINDeWmKTXwjHHZO3UWCULTYL/AfSwS6RSoTvRbsKDcudydSsu504luuwVFfo794W3jMeSK+vlHb/2MLB5zDjvA7iCKM9FlxHIZsvVCqvc1M6BQ8MiDq6mDBMlCdvPsX7Lc+e3VwIDAQAB",
  "llavePrivada": "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9t8983y9Yu5cCpV4HJif8evran0K9w+bg6uUXpzaUhmJKXBE9gblO/ffAXam7dxVZ8QlRQWlaDr5ySkrKcFKj/VCaejwmNpUSaxIN6DTMCunpbwtQjEm0aKPceshuV0rGaUcWttofbde34lK+NUbh+P3Mx+Px2u9ugnwG2on80wT69DElzb3KzEEngP2aOeRLApmzeGc1tAAgKgg0N5aYpNfCMcdk7dRYJQtNgv8B9LBLpFKhO9FuwoNy53J1Ky7nTiW67BUV+jv3hbeMx5Ir6+Udv/YwsHnMOO8DuIIoz0WXEchmy9UKq9zUzoFDwyIOrqYMEyUJ28+xfstz57dXAgMBAAECggEADbjw4hhb8AV0O8sYTQNpMFhOMr1YR3+XAJJySvlbokyXaXIqsRHkBHRW6kFxbc+EP4LcE1YxjO5fahw44qxTM0IMWtAX76+nrV20lZrueV/EtuTC+GrdSJZVBoqUWsl87XMJ+E5LjVXAR7BaycqdZj+V+Vearjtmxs3bXhI1RDsjBFiQAXL8qAEB/vIlfEBbXkVvKTyXk3JGsNUAFlzHEfkfbgVb+S3iDt36tJFcEu2HcZBU3Ul5c1cZK4tR16f2850kcnXyHZXuCMrXMk/I1g2TUwhZ2Xi9FA6YQ4wVv+yu7n0fSLdoazITFm9ZwlhgRI6ASs+F0TYmZUy9wi2pIQKBgQD86y37XtgBZFxuCnSlnjxvPBNBnvGxaD/jGOxaVFL4mfgvNUDqM85XbAAAuPpAdaydxwwGFajOsBfOZlVt2RJ3/mzyGMZ/BNKmasW5euxvJkxReSuomua3K7moj7NPCXsChBPmW2FgvOlREPj7WsKfRucDGDKnXFfTcef7khGv0QKBgQDAB4QpUcnJ2Qjo6nTIi2Ye7Erpn1l24pPOhIfHJayggq/3iJiMetja520f5ocW64f5y/uyy+3zYajA5TqCdbpIFDRPwVcdA4+eHZREbfiPtMGUS0qKAgSGC3ZGbXLrzLuQCh0zL7AF4rtriF6KVkObA5yH7vj1Bj84/1Dx5DUmpwKBgQDV3Cctfq03wB1IDx9DS+HeTPYbbsMAOB6NcO2qE9N00vzBLk6NuvCni3MVKVSyXM5xO3Y3TulGnDAFHxLtp7euLz0AGWL+1J0qiu5WQFLcSY4O9l6sWw7ro9WBasE7+9A/+F67Ulms6xB+s9NU9xHKjLGaNEPgsHyzFoYKeyDpgQKBgHp7EM/uC+AD34v4Jz7Wsu8cVffHHKAYiqAZpiTeocnLMYOYC3zmyjRtkgvb1ORInHU2pzb2nbIz4xgN3ZDimEtrH6aTMgYehFcclLpEzlqStznoAAYgnVQGMY1gOAGwlx2bZd6FFyfZ4yMGWw6vUPWpiwik4wQd1Ot85dszbLdXAoGBALgdGXplVIxMbdHPzoNOFNMPFI+U4YiMKDNmJAgluCbenuzIkPd7lrj3yVNEE4NFpf/leJY5JKjqXZxiwBO0mi1n/J5gPR5erTyzaD069wl5+/6c1nYOZ4J7gegUapD7+Yg7vfogaqIEtf2FZg93hpDbm1P2Z7HXyWc95r69pTCm",
  "fechaCreacion": {
    "$date": "2024-12-23T06:18:13.345Z"
  },
  "__v": 0
}
```
## Pruebas
* Se incluye una colección de postman en este repo, esta colección cuenta con los servicios para realizar pruebas de integración de ambas APIs.
* Debido a la limitante en el tiempo no incluyen pruebas unitarias, estas quedan como un alcanzable junto con el proceso de CICD.

## Dudas, comentarios y sugerencias
Para cualquier duda, comentario o demostración del funcionamiento de la API, contactarme a mi correo o número personal: 
 **mich.palacios.hdz@gmail.com**  
**+52 5526774403**

## Repositorio

[github](https://github.com/aydis20P/evaluacion_kapital)

## Licencia

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.en)
