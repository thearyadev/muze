import { type APIResponse } from '../types';
import { cookies } from 'next/headers';
import * as jwt from "jsonwebtoken"


export const key = "meow"

export function isAuthorized(): APIResponse<string> {
  const cookiestore = cookies()
  const token = cookiestore.get("auth")
  if (!token?.value) {
    return {
      status_code: 401,
      error: "Unauthorized"
    }
  }
  try {
    const jwt_data = jwt.verify(token.value, key)
    return {
      status_code: 200,
      content: jwt_data.toString()
    }
  } catch {

    return {
      status_code: 401,
      error: "Unauthorized"
    }
  }

}

export const protectedAction = <T, Args extends any[]>(fn: (...args: Args) => Promise<APIResponse<T>>) => {
    return async (...args: Args): Promise<APIResponse<T>> => {
        const isAuthenticated = isAuthorized();
        if (isAuthenticated.status_code !== 200) {
            return {
                status_code: 401,
                error: "Unauthorized"
            };
        }
        return await fn(...args);
    };
};

export const openAction = <T, Args extends any[]>(fn: (...args: Args) => Promise<APIResponse<T>>) => {
    return async (...args: Args): Promise<APIResponse<T>> => {
        return await fn(...args);
    };
};



