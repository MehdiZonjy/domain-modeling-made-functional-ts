import {Newtype, iso} from 'newtype-ts'
import {Either} from 'fp-ts/lib/Either'
import {createString} from './constrained-primitives'
import {fromEither, Option} from 'fp-ts/lib/Option'
import {compose} from 'fp-ts/lib/function'
export interface String50 extends Newtype<{readonly String50: unique symbol}, string>{}

const isoString50 = iso<String50>()


export const createEither = (fieldName: string, str: string | undefined): Either<string, String50> => createString(fieldName, isoString50.wrap, 50)(str)
export const createOption = (fieldName: string, str: string | undefined): Option<String50> => compose(fromEither, createString(fieldName, isoString50.wrap, 50))(str)
export const value: (str: String50) => string =  isoString50.unwrap