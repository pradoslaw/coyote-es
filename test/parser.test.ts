import InputAnalyzer from '../src/analyzers';

describe('user analyzers', () => {
  test('retrieve user from input', () => {
    const input = 'user:admin';
    const result = new InputAnalyzer(input).analyze();

    expect(result.user).toBe('admin');
  });

  test('retrieve user from input with apostrophe', () => {
    const input = 'user:"admin"';
    const result = new InputAnalyzer(input).analyze();

    expect(result.user).toBe('admin');
  });

  test('retrieve user with apostrophe and query at the end', () => {
    const input = 'user:"adam boduch" test';
    const result = new InputAnalyzer(input).analyze();

    expect(result.user).toBe('adam boduch');
    expect(result.query).toBe('test');
  });

  test('retrieve user with apostrophe and query at the beggining', () => {
    const input = 'test user:"adam boduch"';
    const result = new InputAnalyzer(input).analyze();

    expect(result.user).toBe('adam boduch');
    expect(result.query).toBe('test');
  });

  test('retrieve user and query at the end', () => {
    const input = 'user:admin test';
    const result = new InputAnalyzer(input).analyze();

    expect(result.user).toBe('admin');
    expect(result.query).toBe('test');
  });

  test('retrieve user and query at the beginning', () => {
    const input = 'test user:admin';
    const result = new InputAnalyzer(input).analyze();

    expect(result.user).toBe('admin');
    expect(result.query).toBe('test');
  });
})

describe('model analyzers', () => {
  test('retrieve model', () => {
    const input = 'is:topic';
    const result = new InputAnalyzer(input).analyze();

    expect(result.model).toBe('Topic');
  });

  test('retrieve model and query at the end', () => {
    const input = 'is:topic test';
    const result = new InputAnalyzer(input).analyze();

    expect(result.model).toBe('Topic');
    expect(result.query).toBe('test');
  });

  test('retrieve model and query at the beginning', () => {
    const input = 'test is:topic test';
    const result = new InputAnalyzer(input).analyze();

    expect(result.model).toBe('Topic');
    expect(result.query).toBe('test test');
  });

  test('retrieve model and user', () => {
    const input = 'is:topic user:admin';
    const result = new InputAnalyzer(input).analyze();

    expect(result.model).toBe('Topic');
    expect(result.user).toBe('admin');
    expect(result.query).toBe('');
  });

  test('retrieve model and user and query', () => {
    const input = 'is:topic user:admin lorem ipsum';
    const result = new InputAnalyzer(input).analyze();

    expect(result.model).toBe('Topic');
    expect(result.user).toBe('admin');
    expect(result.query).toBe('lorem ipsum');
  });
})
