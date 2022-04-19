export default function template(body) {
  return `
  <html>
    <head>
        <title>Issue Tracker</title>
        <meta charset="utf-8">
        <style>
            table.table-hover tr {cursor: pointer;}
            .panel-title a {display: block; width: 100%; cursor: pointer;}
        </style>
        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <!-- Page generated from template -->
      <div id="content">${body}</div>
    </body>
  </html>
  `;
}
