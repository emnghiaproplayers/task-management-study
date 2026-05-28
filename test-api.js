const http = require('http');

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: body ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      } : {}
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(data);
    }
    req.end();
  });
};

async function run() {
  try {
    console.log('--- 1. POST /tasks (Create Task) ---');
    const createRes = await request('POST', '/tasks', {
      title: 'Learn NestJS',
      description: 'Complete REST CRUD module'
    });
    console.log(`Status: ${createRes.statusCode}`);
    console.log(`Body: ${createRes.body}\n`);

    const createdTask = JSON.parse(createRes.body);
    const taskId = createdTask.id;

    console.log('--- 2. GET /tasks (Get List) ---');
    const listRes = await request('GET', '/tasks');
    console.log(`Status: ${listRes.statusCode}`);
    console.log(`Body: ${listRes.body}\n`);

    console.log(`--- 3. GET /tasks/${taskId} (Get One) ---`);
    const oneRes = await request('GET', `/tasks/${taskId}`);
    console.log(`Status: ${oneRes.statusCode}`);
    console.log(`Body: ${oneRes.body}\n`);

    console.log(`--- 4. PATCH /tasks/${taskId} (Update Task) ---`);
    const updateRes = await request('PATCH', `/tasks/${taskId}`, {
      title: 'Learn NestJS Master',
      status: 'IN_PROGRESS'
    });
    console.log(`Status: ${updateRes.statusCode}`);
    console.log(`Body: ${updateRes.body}\n`);

    console.log(`--- 5. DELETE /tasks/${taskId} (Delete Task) ---`);
    const deleteRes = await request('DELETE', `/tasks/${taskId}`);
    console.log(`Status: ${deleteRes.statusCode}`);
    console.log(`Body: ${deleteRes.body}\n`);

    console.log(`--- 6. GET /tasks/${taskId} (Get Miss - 404) ---`);
    const missRes = await request('GET', `/tasks/${taskId}`);
    console.log(`Status: ${missRes.statusCode}`);
    console.log(`Body: ${missRes.body}\n`);

  } catch (err) {
    console.error('Error during API test:', err);
  }
}

run();
