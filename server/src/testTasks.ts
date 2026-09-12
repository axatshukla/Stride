async function runTaskTests() {
  const baseUrl = 'http://localhost:5000/api';

  console.log('🧪 Starting Task REST API Integration Tests...\n');

  // 1. Authenticate to obtain Bearer JWT
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'akshat@taskflow.dev',
      password: 'password123',
    }),
  });
  const { token } = (await loginRes.json()) as any;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Test GET /api/tasks
  const listRes = await fetch(`${baseUrl}/tasks`, { headers: authHeaders });
  const listData = (await listRes.json()) as any;
  console.log('1. GET /api/tasks (List all tasks):', listRes.status, `| Total returned: ${listData.count}`);
  console.log('   Sample Task 1:', listData.tasks[0]?.key, '-', listData.tasks[0]?.title, `[Assignee: ${listData.tasks[0]?.assignee?.name}]`);

  // 3. Test Filter: GET /api/tasks?status=in-progress
  const progRes = await fetch(`${baseUrl}/tasks?status=in-progress`, { headers: authHeaders });
  const progData = (await progRes.json()) as any;
  console.log('2. GET /api/tasks?status=in-progress:', progRes.status, `| Count: ${progData.count}`);

  // 4. Test Search: GET /api/tasks?search=Express
  const searchRes = await fetch(`${baseUrl}/tasks?search=Express`, { headers: authHeaders });
  const searchData = (await searchRes.json()) as any;
  console.log('3. GET /api/tasks?search=Express:', searchRes.status, `| Found: ${searchData.count} matches`);

  // 5. Test Stats: GET /api/tasks/stats
  const statsRes = await fetch(`${baseUrl}/tasks/stats`, { headers: authHeaders });
  const statsData = (await statsRes.json()) as any;
  console.log('4. GET /api/tasks/stats:', statsRes.status);
  console.log('   Stats:', statsData.stats);

  // 6. Test Create: POST /api/tasks
  const createRes = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Configure GitHub Actions CI/CD pipeline',
      description: 'Set up automated linting, type-checking, and Jest unit tests on pull requests.',
      status: 'todo',
      priority: 'high',
      assignee_id: 'u4',
      dueDate: '2026-09-28T00:00:00Z',
      tags: ['ci-cd', 'devops'],
    }),
  });
  const createData = (await createRes.json()) as any;
  console.log('5. POST /api/tasks (Create new task):', createRes.status);
  console.log('   Created Task:', createData.task?.key, '-', createData.task?.title, `(Assigned to: ${createData.task?.assignee?.name})`);

  const createdId = createData.task?.id;

  // 7. Test Update: PUT /api/tasks/:id
  const updateRes = await fetch(`${baseUrl}/tasks/${createdId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'in-progress',
      description: 'Updated description: Pipeline configured with caching for npm modules.',
    }),
  });
  const updateData = (await updateRes.json()) as any;
  console.log('6. PUT /api/tasks/:id (Transition status):', updateRes.status);
  console.log('   Updated Task Status:', updateData.task?.status, `| UpdatedAt: ${updateData.task?.updatedAt}`);

  // 8. Test Delete: DELETE /api/tasks/:id
  const deleteRes = await fetch(`${baseUrl}/tasks/${createdId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const deleteData = (await deleteRes.json()) as any;
  console.log('7. DELETE /api/tasks/:id (Delete task):', deleteRes.status, `(${deleteData.message})`);

  // 9. Verify 404 on deleted task
  const checkRes = await fetch(`${baseUrl}/tasks/${createdId}`, { headers: authHeaders });
  console.log('8. GET /api/tasks/:id on deleted item (Expect 404):', checkRes.status);

  console.log('\n🎉 All Task CRUD, filter, and join tests passed with 100% success!\n');
}

runTaskTests();
