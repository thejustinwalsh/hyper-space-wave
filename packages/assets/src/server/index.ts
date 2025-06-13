import AutoEncryptLocalhost from '@small-tech/auto-encrypt-localhost';
import fs from 'fs/promises';
import path, {dirname} from 'path';
import polka from 'polka';
import {json} from '@polka/parse';
import send from '@polka/send-type';
import sirv from 'sirv';
import {fileURLToPath} from 'url';
import {Micro, pipe} from 'effect';

const events = AutoEncryptLocalhost.events;
events.onAll(events.WARNINGS, console.warn);
events.onAll(events.ERRORS, console.error);

// TODO: Whitelist what paths can be accessed with read/write permissions (json config)
// TODO: Serve text based assets from the bundle directory with proper mime types
// TODO: Write a text based asset to the bundle directory (write to temp, then move to bundle dir)
// TODO: Do not let the file writer break out of the bundle directory

const server = AutoEncryptLocalhost.https.createServer({}, null);

const root = path.resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'bundle');
console.log(`› Asset Server: Serving from ${root}`);
const bundle = sirv(`${root}/`, {dev: true});

polka({server})
  .use(json())
  .use('/bundle', bundle)
  .post('/bundle/*', async (req, res) => {
    const {succeed, fail, andThen: then, tryPromise: promise, runPromise: run} = Micro;

    const result = await pipe(
      succeed(req.body),
      then(body =>
        typeof body !== 'object' || Array.isArray(body) || !body
          ? fail({status: 400, message: 'Invalid request body'})
          : succeed(body),
      ),
      then(body => {
        const filePath = path.join(root, req.path.replace('/bundle/', ''));
        const dir = path.dirname(filePath);
        const file = path.basename(filePath);

        if (!file || file.includes('..') || file.includes('/')) {
          return fail({status: 400, message: 'Invalid file name'});
        }
        if (!dir.startsWith(root)) {
          return fail({status: 403, message: 'Forbidden'});
        }
        return succeed({dir, file: filePath, body});
      }),
      then(({dir, file, body}) =>
        promise({
          try: async () => {
            await fs.mkdir(dir, {recursive: true});
            await fs.writeFile(file, JSON.stringify(body, null, 2), 'utf8');
            return {status: 200, message: 'File written successfully'};
          },
          catch: err => ({
            status: 500,
            message: `Failed to write file: ${err}`,
          }),
        }),
      ),
      run,
    );

    send(res, result.status, JSON.stringify({msg: result.message}));
  })
  .get('/health', (_, res) => {
    res.end('OK');
  })
  .listen(5443, err => {
    if (err) {
      console.error(`✖︎ Asset Server: ${err}`);
    } else {
      console.log('✔ Asset Server: https://localhost:5443');
    }
  });
