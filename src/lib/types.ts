export type APISuccessResponse<T> = {
  status_code: number
  content: T
  error: null
}

export type APIErrorResponse = {
  status_code: number
  content: null
  error: string
}

export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse

// functions used to test types

function test(t?: boolean): APIResponse<number> {
  if (t) {
    return {
      status_code: 200,
      content: null,
      error: 'error',
    }
  }

  return {
    status_code: 200,
    content: 5,
    error: null,
  }
}

function test2() {
  const t = test()

  if (t.error !== null) {
    const w = t.error
    return
  }

  const e = t.content
}
