# Morfeo Creative 🎨

UI playground para generación de visuals con IA — conectada a ComfyDeploy.

## Stack

- **Frontend:** Next.js 15 + Tailwind CSS
- **Backend:** API Routes de Next.js
- **Storage + DB:** Supabase
- **AI Engine:** ComfyDeploy

## Setup

### 1. Supabase
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a SQL Editor y ejecutar `supabase-schema.sql`
3. Crear bucket en Storage → **morfeo-assets** (público)
4. Copiar URL y keys del proyecto

### 2. Variables de entorno
Completar `.env.local`:

```env
COMFY_DEPLOY_API_KEY=tu_key
COMFY_DEPLOY_DEPLOYMENT_ID=tu_deployment_id

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Desarrollo local
```bash
npm install
npm run dev
```

### 4. Deploy en Vercel
1. Push a GitHub
2. Importar repo en [vercel.com](https://vercel.com)
3. Agregar variables de entorno en Vercel dashboard
4. Deploy 🚀

## Flujo

1. La agencia llena el form con nombre de marca, URL, brief y sube imágenes
2. Las imágenes se suben a Supabase Storage → se obtienen URLs públicas
3. Se llama al workflow de ComfyDeploy con esos inputs
4. La UI hace polling cada 3 segundos hasta recibir el output
5. El resultado se muestra en pantalla y se guarda en la DB
