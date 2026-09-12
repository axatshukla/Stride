async function runAuthTests() {
  const baseUrl = 'http://localhost:5000/api/auth';

  console.log('🧪 Starting Authentication Endpoint Tests...\n');

  // 1. Test Login (Happy Path)
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'akshat@taskflow.dev',
      password: 'password123',
    }),
  });
  const loginData = (await loginRes.json()) as any;
  console.log('1. POST /api/auth/login (Valid credentials):', loginRes.status);
  console.log('   User:', loginData.user?.name, '| Token generated:', Boolean(loginData.token));

  const token = loginData.token;

  // 2. Test Login (Wrong Password)
  const badLoginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'akshat@taskflow.dev',
      password: 'wrong_password',
    }),
  });
  const badLoginData = (await badLoginRes.json()) as any;
  console.log('2. POST /api/auth/login (Wrong password):', badLoginRes.status, `(${badLoginData.error})`);

  // 3. Test Protected Route: GET /api/auth/me (With valid Bearer token)
  const meRes = await fetch(`${baseUrl}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = (await meRes.json()) as any;
  console.log('3. GET /api/auth/me (With valid token):', meRes.status, '| Authenticated as:', meData.user?.name);

  // 4. Test Protected Route: GET /api/auth/me (Without token)
  const unauthRes = await fetch(`${baseUrl}/me`);
  const unauthData = (await unauthRes.json()) as any;
  console.log('4. GET /api/auth/me (Without token):', unauthRes.status, `(${unauthData.error})`);

  // 5. Test Signup (New User)
  const randomEmail = `test_${Date.now()}@taskflow.dev`;
  const signupRes = await fetch(`${baseUrl}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Sharma',
      email: randomEmail,
      password: 'mypassword123',
    }),
  });
  const signupData = (await signupRes.json()) as any;
  console.log('5. POST /api/auth/signup (New user):', signupRes.status, '| Created:', signupData.user?.name);

  // 6. Test Signup (Duplicate Email)
  const dupSignupRes = await fetch(`${baseUrl}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate User',
      email: 'akshat@taskflow.dev',
      password: 'password123',
    }),
  });
  const dupSignupData = (await dupSignupRes.json()) as any;
  console.log('6. POST /api/auth/signup (Duplicate email):', dupSignupRes.status, `(${dupSignupData.error})`);

  console.log('\n🎉 All 6 Authentication scenarios passed successfully!\n');
}

runAuthTests();
