import { Newtype, iso } from 'newtype-ts'
import { Either, left, right } from 'fp-ts/lib/Either'
import { createString, createLike, isUndefined, isEmptyOrUndefined, createInt, createDecimal, createOptionalString } from './constrained-primitives'
import { fromEither, Option } from 'fp-ts/lib/Option'
import { compose } from 'fp-ts/lib/function'
import * as R from 'ramda'


export namespace String50 {
  export interface String50 extends Newtype<{ readonly String50: unique symbol }, string> { }

  const isoString50 = iso<String50>()


  export const createEither = (fieldName: string, str: string | undefined): Either<string, String50> => createString(fieldName, isoString50.wrap, 50)(str)
  export const createOption = (fieldName: string, str: string | undefined): Either<string, Option<String50>> => createOptionalString(fieldName, isoString50.wrap, 50)(str)
  export const value: (str: String50) => string = isoString50.unwrap
}

export namespace EmailAddress {
  export interface EmailAddress extends Newtype<{ readonly EmailAddress: unique symbol }, string> { }

  const isoEmailAddress = iso<EmailAddress>()

  const emailPattern = /.+@.+/g

  export const createEither = (fieldName: string, str: string | undefined): Either<string, EmailAddress> => createLike(fieldName, isoEmailAddress.wrap, emailPattern)(str)
  export const createOption = (fieldName: string, str: string | undefined): Option<EmailAddress> => compose(fromEither, createLike(fieldName, isoEmailAddress.wrap, emailPattern))(str)
  export const value: (str: EmailAddress) => string = isoEmailAddress.unwrap
}

export namespace USStateCode {
  export interface UsStateCode extends Newtype<{ readonly UsStateCode: unique symbol }, string> { }

  const isoUsStateCode = iso<UsStateCode>()


  const usStateCodePattern = /^(A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/g

  export const createEither = (fieldName: string, str: string | undefined): Either<string, UsStateCode> => createLike(fieldName, isoUsStateCode.wrap, usStateCodePattern)(str)
  export const createOption = (fieldName: string, str: string | undefined): Option<UsStateCode> => compose(fromEither, createLike(fieldName, isoUsStateCode.wrap, usStateCodePattern))(str)
  export const value: (str: UsStateCode) => string = isoUsStateCode.unwrap
}


export namespace VipStatus {
  interface Normal {
    _tag: 'normal'
  }
  interface Vip {
    _tag: 'vip'
  }
  export type VipStatus = Normal | Vip


  export const createEither = (fieldName: string, str: string | undefined): Either<string, VipStatus> => {
    if (isUndefined(str)) {
      return left(`${fieldName} is undefined`)
    }

    switch (str.toLowerCase()) {
      case 'normal': return right({ _tag: 'normal' })
      case 'vip': return right({ _tag: 'vip' })
      default: return left(`${fieldName} can be either (normal, vip)`)
    }
  }
  export const createOption = (fieldName: string, str: string | undefined): Option<VipStatus> => fromEither(createEither(fieldName, str))

  export const value = (status: VipStatus): string => {
    switch (status._tag) {
      case 'normal': return 'normal'
      case 'vip': return 'vip'
    }
  }
}

export namespace ZipCode {
  export interface ZipCode extends Newtype<{ readonly ZipCode: unique symbol }, string> { }

  const isoZipCode = iso<ZipCode>()


  const zipCodePattern = /\d{5}/g

  export const createEither = (fieldName: string, str: string | undefined): Either<string, ZipCode> => createLike(fieldName, isoZipCode.wrap, zipCodePattern)(str)
  export const createOption = (fieldName: string, str: string | undefined): Option<ZipCode> => compose(fromEither, createLike(fieldName, isoZipCode.wrap, zipCodePattern))(str)
  export const value: (str: ZipCode) => string = isoZipCode.unwrap
}


export namespace OrderId {
  export interface OrderId extends Newtype<{ readonly OrderId: unique symbol }, string> { }
  const isoOrderId = iso<OrderId>()

  export const createEither = (filedName: string, str: string): Either<string, OrderId> => createString(filedName, isoOrderId.wrap, 50)(str)
  export const value: (orderId: OrderId) => string = isoOrderId.unwrap
}

export namespace OrderLineId {
  export interface OrderLineId extends Newtype<{ readonly OrderLineId: unique symbol }, string> { }
  const isoOrderLineId = iso<OrderLineId>()

  export const createEither = (fieldName: string, str: string): Either<string, OrderLineId> => createString(fieldName, isoOrderLineId.wrap, 50)(str)
  export const value: (orderLineId: OrderLineId) => string = isoOrderLineId.unwrap
}


export namespace WidgetCode {
  export interface WidgetCode extends Newtype<{ readonly WidgetCode: unique symbol }, string> { }

  const isoWidgetCode = iso<WidgetCode>()


  const widgetCodePattern = /W\d{4}/g

  export const createEither = (fieldName: string, str: string | undefined): Either<string, WidgetCode> => createLike(fieldName, isoWidgetCode.wrap, widgetCodePattern)(str)
  export const createOption = (fieldName: string, str: string | undefined): Option<WidgetCode> => compose(fromEither, createLike(fieldName, isoWidgetCode.wrap, widgetCodePattern))(str)
  export const value: (str: WidgetCode) => string = isoWidgetCode.unwrap
}

export namespace GizmoCode {
  export interface GizmoCode extends Newtype<{ readonly GizmoCode: unique symbol }, string> { }

  const isoGizmoCode = iso<GizmoCode>()


  const gizmoCodePattern = /G\d{3}/g

  export const createEither = (fieldName: string, str: string | undefined): Either<string, GizmoCode> => createLike(fieldName, isoGizmoCode.wrap, gizmoCodePattern)(str)
  export const createOption = (fieldName: string, str: string | undefined): Option<GizmoCode> => compose(fromEither, createLike(fieldName, isoGizmoCode.wrap, gizmoCodePattern))(str)
  export const value: (str: GizmoCode) => string = isoGizmoCode.unwrap
}


export namespace ProductCode {
  export type ProductCode = WidgeCodeWrapper | GizmoCodeWrapper

  interface WidgeCodeWrapper {
    val: WidgetCode.WidgetCode,
    _tag: 'widget'
  }

  interface GizmoCodeWrapper {
    val: GizmoCode.GizmoCode
    _tag: 'gizmo'
  }

  export const value = (str: ProductCode): string => {
    switch (str._tag) {
      case 'gizmo': return GizmoCode.value(str.val)
      case 'widget': return WidgetCode.value(str.val)
    }
  }

  export const createEither = (fieldName: string, val: string): Either<string, ProductCode> => {
    if (isEmptyOrUndefined(val)) {
      return left(`${fieldName} must not be empty or undefined`)
    }

    if (val.startsWith('W')) {
      return WidgetCode.createEither(fieldName, val).map(val => ({ _tag: 'widget', val }))
    }

    if (val.startsWith('G')) {
      return GizmoCode.createEither(fieldName, val).map(val => ({ _tag: 'gizmo', val }))
    }

    return left(`format not recognized ${val} ${fieldName}`)
  }
}

export namespace UnitQuantity {
  export interface UnitQuantity extends Newtype<{ readonly UnitQuantity: unique symbol }, number> { }
  const isoUnitQuantity = iso<UnitQuantity>()

  export const createEither = (fieldName: string, val: number): Either<string, UnitQuantity> => createInt(fieldName, isoUnitQuantity.wrap, 0, 1000)(val)

  export const value: (unit: UnitQuantity) => number = isoUnitQuantity.unwrap
}


export namespace KilogramQuantity {
  export interface KilogramQuantity extends Newtype<{ readonly KilogramQuantity: unique symbol }, number> { }

  const isoKilogramQuantity = iso<KilogramQuantity>()

  export const createEither = (fieldName: string, val: number): Either<string, KilogramQuantity> => createDecimal(fieldName, isoKilogramQuantity.wrap, 0, 1000)(val)

  export const value: (unit: KilogramQuantity) => number = isoKilogramQuantity.unwrap
}

export namespace OrderQuantity {
  interface UnitQuantityWrapper {
    val: UnitQuantity.UnitQuantity
    _tag: 'unitQuantity'
  }
  interface KilogramQuantityWrapper {
    val: KilogramQuantity.KilogramQuantity
    _tag: 'kilogramQuantity'
  }


  export type OrderQuantity = UnitQuantityWrapper | KilogramQuantityWrapper

  export const value = (val: OrderQuantity): number => {
    switch (val._tag) {
      case 'kilogramQuantity': return KilogramQuantity.value(val.val)
      case 'unitQuantity': return UnitQuantity.value(val.val)
    }
  }

  export const createEither = (fieldName: string, productCode: ProductCode.ProductCode, quantity: number): Either<string, OrderQuantity> => {
    switch (productCode._tag) {
      case 'widget': return UnitQuantity.createEither(fieldName, quantity).map(val => ({ _tag: 'unitQuantity', val }))
      case 'gizmo': return KilogramQuantity.createEither(fieldName, quantity).map(val => ({ _tag: 'kilogramQuantity', val }))
    }
  }
}


export namespace Price {
  export interface Price extends Newtype<{readonly Price: unique symbol}, number> {}

  const isoPrice = iso<Price>()

  export const createEither = (fieldName: string, val: number): Either<string, Price> => createDecimal(fieldName, isoPrice.wrap, 0, 10000)(val)
  export const value: (val: Price) => number = isoPrice.unwrap

  export const multiple = (qty: number, price: Price): Price => isoPrice.modify(R.multiply(qty))(price)
}

export namespace BillingAmount {
  export interface BillingAmount extends Newtype< {readonly BillingAmount: unique symbol}, number> {}

  const isoBillingAmount = iso<BillingAmount>()

  export const createEither = (val: number): Either<string, BillingAmount> => createDecimal('BillingAmount', isoBillingAmount.wrap, 0, 10000)(val)
  export const value: (val: BillingAmount) => number = isoBillingAmount.unwrap

  export const sumPrices = (prices: Price.Price[]): Either<string,BillingAmount> => compose(
    createEither,
    R.sum,
    R.map(Price.value)
  )(prices)
}

export namespace PdfAttachment {
  export interface PdfAttachment {
    name: string
    bytes: Buffer
  }
}

export namespace PromitionCode {
  export interface PromitionCode extends Newtype<{readonly PromitionCode: unique symbol}, string> {}

  const isoPromitionCode = iso<PromitionCode>()

  export const createEither = (fieldName: string, val: string) : Either<string, PromitionCode> => createString(fieldName, isoPromitionCode.wrap, 30)(val)
  export const value: (val: PromitionCode) => string = isoPromitionCode.unwrap
}

