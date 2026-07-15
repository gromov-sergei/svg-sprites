import { createHandler, StartServer } from '@solidjs/start/server'

function Document(props) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SolidStart Vite sprite fixture</title>
        {props.assets}
      </head>
      <body>
        <div id="app">{props.children}</div>
        {props.scripts}
      </body>
    </html>
  )
}

export default createHandler(() => <StartServer document={Document} />)
