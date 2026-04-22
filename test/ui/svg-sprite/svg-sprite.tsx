/**
 * SVG-спрайты: типы и React-компонент.
 * @generated — this file is auto-generated, do not edit manually.
 */
import type { SVGAttributes, HTMLAttributes } from 'react'
import styles from './svg-sprite.module.css'

/** Имена иконок спрайта «icons». */
export type IconsIconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'check'
  | 'discount-shape'
  | 'flash'
  | 'heart-tick'
  | 'heart-tick (1-я копия)'

/** Имена иконок спрайта «logos». */
export type LogosIconName =
  | 'github'
  | 'twitter'
  | 'youtube'

/** Маппинг имени спрайта на тип его иконок. */
export type SpriteMap = {
  icons: IconsIconName
  logos: LogosIconName
}

/** Имя спрайта. */
export type SpriteName = keyof SpriteMap

/** Спрайт по умолчанию. */
export type DefaultSprite = 'icons'

/** Имя иконки для конкретного спрайта. */
export type IconName<S extends SpriteName = SpriteName> = SpriteMap[S]

const PUBLIC_PATH = ''
const DEFAULT_SPRITE: SpriteName = 'icons'

const SPRITE_FILES: Record<SpriteName, string> = {
  icons: 'icons.sprite.svg',
  logos: 'logos.sprite.svg',
}

type IconBaseProps<S extends SpriteName> = {
  /** Имя иконки. */
  icon: IconName<S>
  /** Имя спрайта. По умолчанию: первый из конфига. */
  sprite?: S
}

type IconSvgProps<S extends SpriteName> = IconBaseProps<S> & {
  wrapped?: false
} & SVGAttributes<SVGSVGElement>

type IconWrappedProps<S extends SpriteName> = IconBaseProps<S> & {
  wrapped: true
} & HTMLAttributes<HTMLSpanElement>

export type SvgSpriteProps<S extends SpriteName = DefaultSprite> =
  | IconSvgProps<S>
  | IconWrappedProps<S>

/**
 * Иконка из SVG-спрайта.
 *
 * Используется для:
 *  - отображения иконки через `<use href="...">`
 *  - обёртки в `<span>` через проп `wrapped`
 *
 * Спрайт по умолчанию: «icons».
 */
export const SvgSprite = <S extends SpriteName = DefaultSprite>(props: SvgSpriteProps<S>) => {
  const { icon, sprite = DEFAULT_SPRITE as S, wrapped, className, ...rest } = props
  const href = `${PUBLIC_PATH}/${SPRITE_FILES[sprite]}#${icon}`

  if (wrapped) {
    const { ...htmlAttr } = rest as HTMLAttributes<HTMLSpanElement>
    return (
      <span {...htmlAttr} className={[styles.wrap, className].filter(Boolean).join(' ')}>
        <svg>
          <use href={href} />
        </svg>
      </span>
    )
  }

  const { ...svgAttr } = rest as SVGAttributes<SVGSVGElement>
  return (
    <svg {...svgAttr} className={[styles.root, className].filter(Boolean).join(' ')}>
      <use href={href} />
    </svg>
  )
}
