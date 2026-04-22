---
title: Файлы роутинга
scope: applied
keywords: [page.tsx, layout.tsx, error.tsx, not-found.tsx, loading.tsx, App Router, metadata]
when: "Работа с файлами роутинга Next.js App Router: page, layout, error, not-found"
---
# Файлы роутинга

Правила для специальных файлов App Router (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx` и др.) — чем наш подход отличается от дефолтного.

## Что нужно знать

Страница в проекте — это два файла: экран в `src/screens/` (вся логика, стили, зависимости) и `page.tsx` в `src/app/` (точка входа для роутинга Next.js). Экран генерируется из шаблона, `page.tsx` создаётся вручную.

## Организация

- `page.tsx` — тонкий файл: только `metadata` и рендер экрана. Логика, стили и зависимости живут в экране, не в `page.tsx`.
- `error.tsx` и `not-found.tsx` делегируют разметку экранам по тому же принципу.
- `layout.tsx` — точка подключения провайдеров и глобальных стилей. Вёрстка layout-обёрток выносится в слой `layouts/`.
- Стили в файлах роутинга не используются — стилизация только внутри вызываемых компонентов.

## Реализация

- Каждый `page.tsx` экспортирует `metadata` с `title` — он подставляется в шаблон корневого layout (`%s | App`).
- Корневой `layout.tsx` задаёт `metadata` с `title.template`, `description`, `metadataBase` и OpenGraph-настройками.

## Примеры

`src/app/profile/[id]/page.tsx`

```tsx
import type { Metadata } from 'next'
import { ProfileScreen } from '@/screens/profile'

export const metadata: Metadata = {
  title: 'Профиль',
  description: 'Страница профиля пользователя',
}

type ProfilePageProps = {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params

  return <ProfileScreen id={id} />
}
```

`src/app/error.tsx`

```tsx
'use client'

import { ErrorScreen } from '@/screens/error'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  return <ErrorScreen error={error} reset={reset} />
}

export default ErrorPage
```
