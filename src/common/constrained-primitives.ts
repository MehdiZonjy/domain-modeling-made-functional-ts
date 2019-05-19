import {Either, left, right} from 'fp-ts/lib/Either'
import {Curried4} from 'fp-ts/lib/function'
type Constructor<T,U> = (t:T) => U

type CreateConstrainedString = <T>(fieldName: string, costr: Constructor<string, T>, max: number) => (val: string | undefined) => Either<string, T>
type CreateConstrainedLike = <T>(fieldName: string, costr: Constructor<string, T>, pattern: RegExp) => (val: string | undefined) => Either<string, T>
type CreateConstrainedInt = <T>(fieldName: string, ctor: Constructor<number, T>, min: number, max: number) => (val: number | undefined) => Either<string, T>
type CreateConstrainedDecimal = <T>(fieldName: string, ctor: Constructor<number, T>, min: number, max: number) => (val: number | undefined) => Either<string, T>



export const isUndefined = <T>(t: T | undefined): t is undefined => t === undefined
export const isEmptyOrUndefined = (str: string | undefined): str is undefined => isUndefined(str) || str.length === 0
export const inRange = (min: number, max: number, n:number) => n >= min && n <= max

export const createString: CreateConstrainedString = <T>(fieldName: string, costr: Constructor<string,T>, max: number) => (val: string | undefined): Either<string, T> => {
  if(isEmptyOrUndefined(val)) {
    return left(`${fieldName} must not be empty or undefined`)
  }

  if(val.length > max) {
    return left(`${fieldName} must be less than ${max}`)
  }
  return right(costr(val))
}


export const createLike: CreateConstrainedLike = <T>(fieldName: string, costr: Constructor<string,T>, pattern: RegExp) => (val: string | undefined): Either<string, T> => {
  if(isEmptyOrUndefined(val)) {
    return left(`${fieldName} must not be empty or undefined`)
  }

  
  if(pattern.test(val)) {
    return left(`${fieldName} does not match pattern ${pattern}`)
  }
  return right(costr(val))
}


export const createInt: CreateConstrainedInt = <T>(fieldName: string, costr: Constructor<number,T>, min: number, max: number) => (val: number | undefined): Either<string, T> => {
  if(isUndefined(val)) {
    return left(`${fieldName} must not be undefined`)
  }

  if(!inRange(min, max, val)) {
    return left(`${fieldName} should be between ${min} and ${max}`)
  }

  if(!Number.isInteger(val)) {
    return left(`${fieldName} should be integer`)
  }

  return right(costr(val))
}


export const createDecimal: CreateConstrainedDecimal = <T>(fieldName: string, costr: Constructor<number,T>, min: number, max: number) => (val: number | undefined): Either<string, T> => {
  if(isUndefined(val)) {
    return left(`${fieldName} must not be undefined`)
  }

  if(!inRange(min, max, val)) {
    return left(`${fieldName} should be between ${min} and ${max}`)
  }

  return right(costr(val))
}


