import https from 'node:https';

export function httpsGet(url, auth) {
  return new Promise((resolvePromise, rejectPromise) => {
    const requestUrl = new URL(url);
    const headers = {};

    if (auth?.username && auth?.password) {
      const credentials = Buffer.from(`${auth.username}:${auth.password}`, 'utf8').toString('base64');
      headers.Authorization = `Basic ${credentials}`;
    }

    const request = https.request(
      requestUrl,
      {
        method: 'GET',
        headers,
        rejectUnauthorized: false,
        timeout: 10000
      },
      (response) => {
        response.resume();
        response.on('end', () => {
          resolvePromise({
            statusCode: response.statusCode ?? 0
          });
        });
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error('Request timed out'));
    });
    request.on('error', rejectPromise);
    request.end();
  });
}
