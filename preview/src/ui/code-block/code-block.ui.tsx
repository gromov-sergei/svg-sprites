import { useState, useMemo } from 'react'
import cl from 'clsx'
import { highlight } from './lib/highlight.lib'
import type { CodeBlockProps } from './types/code-block.type'
import styles from './styles/code-block.module.css'

export const CodeBlock = (props: CodeBlockProps) => {
  const { code, language = 'html', copyable = true, className, ...htmlAttr } = props

  const [isCopied, setIsCopied] = useState(false)

  const highlightedHtml = useMemo(() => highlight(code, language), [code, language])

  const handleCopy = (): void => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    })
  }

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      <pre className={styles.pre}>
        <code className={cl(styles.code, styles[language])} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
      </pre>
      {copyable && (
        <button type="button" className={styles.copyButton} onClick={handleCopy}>
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  )
}
