export async function onRequest(context) {
  const client_id = context.env.GITHUB_CLIENT_ID;
  const client_secret = context.env.GITHUB_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return new Response(
      'GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variable is missing on Cloudflare Pages.',
      { status: 500 }
    );
  }

  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');

  if (!code) {
    return new Response('Authorization code is missing from GitHub redirect.', { status: 400 });
  }

  // Exchange the code for an access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(`OAuth Error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
  }

  const token = tokenData.access_token;

  // Return the script to communicate back to the Decap CMS parent window
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Authenticating...</title>
    </head>
    <body>
      <p>Please wait while we log you in...</p>
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("Handshake received from: ", e.origin);
            
            const postMsgContent = {
              token: ${JSON.stringify(token)},
              provider: "github"
            };
            
            window.opener.postMessage(
              'authorization:github:success:' + JSON.stringify(postMsgContent),
              e.origin
            );
          }

          window.addEventListener("message", receiveMessage, false);

          // Initiate the handshake with the parent window
          window.opener.postMessage("authorizing:github", "*");
        })()
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
