# Mentora Web (`@mentora/web`)

Üretim odaklı React + TypeScript + Vite istemcisi. İş kuralları ve API sözleşmeleri için kaynak: `apps/mobile`. Ürün gereksinimi özeti: **`Mentora Web - 1 (1).pdf`** (repo dışındaki müşteri dokümanı ile aynı başlık).

## Gereksinimler

- Node 20+
- pnpm 10 (monorepo kökünde)

## Ortam değişkenleri

Kök `apps/web/.env.example` dosyasını kopyalayarak `.env` oluşturun. **Gizli anahtarları repoya koymayın.**

| Değişken | Açıklama |
| --- | --- |
| `VITE_API_BASE_URL` | **Zorunlu.** Backend taban URL’si (sonunda `/` yok). Örn. `http://localhost:4000`. Axios istekleri doğrudan bu adrese gider; Network sekmesinde tam URL görünür. |
| `VITE_APP_ENV` | `development` / `production` |
| `VITE_APP_NAME` | Ürün adı |
| `VITE_SOCKET_URL` | İsteğe bağlı gerçek zamanlı kanal |
| `VITE_SENTRY_DSN` | İsteğe bağlı Sentry |

### Geliştirme kurulumu

1. `apps/web/.env` içinde `VITE_API_BASE_URL=http://localhost:4000` (veya API’nizin adresi).
2. Backend’de `CORS_ORIGINS` içine Vite origin’inizi ekleyin (varsayılan port `5173`): `http://localhost:5173`.
3. `pnpm --filter @mentora/web dev` — istekler `http://localhost:4000/api/v1/...` gibi doğrudan API’ye gider.

## Komutlar

```bash
pnpm install
pnpm --filter @mentora/web dev
pnpm --filter @mentora/web build
pnpm --filter @mentora/web lint
pnpm --filter @mentora/web typecheck
```

## Mimari

- **Özellik klasörleri:** `src/features/*`
- **API:** `src/api/client.ts`, `interceptors.ts`, `endpoints.ts`
- **Durum:** Zustand (`src/app/store/authStore.ts`)
- **Sunucu durumu:** TanStack Query
- **Form:** React Hook Form + Zod
- **Arayüz metinleri:** Türkçe (`src/constants/strings.ts`)
- **Ekran–API eşlemesi:** `WEB_SCREEN_API_MAP.md`

## Husky

`apps/web` içinde `pnpm install` sonrası `prepare` betiği Husky’yi bağlar; `pre-commit` lint-staged çalıştırır.

## Sorun giderme

### Giriş isteği “Provisional headers” / CORS

Tarayıcı `http://localhost:5173` iken API `http://localhost:4000` gibi **başka bir origin** ise, backend `Access-Control-Allow-Origin` ile Vite origin’ine izin vermelidir.

**Mobil neden çalışıyor?** React Native / Expo’daki Axios isteği **tarayıcı sayfası değildir**; çoğu zaman `Origin` başlığı gönderilmez veya tarayıcıdaki gibi aynı-kaynak kuralı uygulanmaz. **Web’de** Chrome `Origin: http://localhost:5173` gönderir; bu adres `CORS_ORIGINS` listesinde yoksa istek bloklanır (Axios “Network Error”).

**Ne yapmalısınız?**

- API’yi **siz çalıştırıyorsanız:** `apps/backend` için `CORS_ORIGINS` içine `http://localhost:5173` (ve kullandığınız Vite portu) ekleyin, sunucuyu yeniden başlatın.
- Uzak API kullanıyorsanız: sunucu tarafında aynı origin’in CORS’ta tanımlı olduğundan emin olun.

### `insertBefore` / DOM hataları

Çeviri eklentileri sayfaya enjekte ederek React ağacıyla çakışabilir. Hata devam ederse eklentileri (ör. sayfa çevirisi) kapatıp yeniden deneyin.
