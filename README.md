# Fortnite-Locker-Image

Generate a high-quality image of your Fortnite locker with all your cosmetics, sorted by rarity and release date.

![Example](./example.png)

---

## Features
- Fast image generation (seconds for hundreds of items)
- Supports all cosmetic types (outfit, emote, spray, etc.)
- Rarity and series backgrounds (Marvel, DC, Icon, etc.)
- Square grid layout for best visual balance
- Use via `ScriptExample.js` or your own code (it is a adaptable helper to all codespaces)

---

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/STWJXSX/Fortnite-Locker-Image.git
cd Fortnite-Locker-Image
```

### 2. Install Node.js 22+
Download and install Node.js version 22 or higher from [nodejs.org](https://nodejs.org/).

### 3. Install dependencies
```sh
npm i
```

### 4. Configure your credentials in the ScriptExample.js
```js
const accesToken = ""
const accountid = ""
const type = "all" //you can chose different types
```

❕ configure the save path on generateLocker.js

You can set `LOCKER_FILTER_TYPE` to `all`, `outfit`, `emote`, `spray`, etc...

### 5. Generate your locker image
Run with either script:
```sh
node ScriptExample.js
```
The generated image will be saved in the folder you put in the generateLocker.js

---

## How it works
- The script connects to Epic Games and fortnite-api.com to fetch your cosmetics.
- It sorts items by rarity and release date.
- Images are downloaded and composed into a single PNG file.
- Rarity and series backgrounds are applied for each item.

---

## Creator
**🔥 Created by [STWJXSX](https://github.com/STWJXSX)**

<img src="https://camo.githubusercontent.com/482003278e954a461d2babe963a0051420d45abe415d740e80e8d543efeee791/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f617661746172732f3830373538363831373538313930383030382f37663339316635373630356436623637626364616137393039626236646335392e776562703f73697a653d31303234" width="100" height="100" />

---

# Fortnite-Locker-Image (Español)

Genera una imagen de alta calidad de tu taquilla de Fortnite con todos tus cosméticos, ordenados por rareza y fecha de salida.

![Ejemplo](./example.png)

---

## Características
- Generación de imagen rápida (segundos para cientos de ítems)
- Soporta todos los tipos de cosméticos (skin, gesto, grafiti, etc.)
- Fondos de rareza y series (Marvel, DC, Icon, etc.)
- Cuadrícula equilibrada para mejor visualización
- Uso con `ScriptExample.js` o tu propio codigo (es un helper adaptable a cualquier codespace)

---

## Primeros pasos

### 1. Clona el repositorio
```sh
git clone https://github.com/STWJXSX/Fortnite-Locker-Image.git
cd Fortnite-Locker-Image
```

### 2. Instala Node.js 22+
Descarga e instala Node.js versión 22 o superior desde [nodejs.org](https://nodejs.org/).

### 3. Instala los módulos
```sh
npm i
```

### 4. Configura tus credenciales en ScriptExample
```js
const accesToken = ""
const accountid = ""
const type = "all" //you can chose different types
```

❕ Configura la carpeta para guardar imagenes en imageLocker.js

Puedes poner `LOCKER_FILTER_TYPE` como `all`, `outfit`, `emote`, `spray`, etc.

### 5. Genera la imagen de tu taquilla
Ejecuta cualquiera de los scripts:
```sh
node ScriptExample.js
```
La imagen generada se guardará en la carpeta configurada por ti.

---

## Cómo funciona
- El script conecta con Epic Games y fortnite-api.com para obtener tus cosméticos.
- Ordena los ítems por rareza y fecha de salida.
- Descarga y compone las imágenes en un solo archivo PNG.
- Aplica fondos de rareza y series para cada ítem.

---

## Creador
**🔥 Creado por [STWJXSX](https://github.com/STWJXSX)**

<img src="https://camo.githubusercontent.com/482003278e954a461d2babe963a0051420d45abe415d740e80e8d543efeee791/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f617661746172732f3830373538363831373538313930383030382f37663339316635373630356436623637626364616137393039626236646335392e776562703f73697a653d31303234" width="100" height="100" />

