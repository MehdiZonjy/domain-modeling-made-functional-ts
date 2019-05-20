
import { ProductCode, PromitionCode, OrderLineId, OrderQuantity, OrderId, Price, BillingAmount, EmailAddress } from "./common/simple-types";
import { Errors, Inputs, Outputs } from "./place-order/types";
import {TaskEither} from 'fp-ts/lib/TaskEither'
import { CustomerInfo, Address } from "./compound-types";
import { Option } from "fp-ts/lib/Option";
import { Newtype, iso } from "newtype-ts";

export type CheckProductCodeExists = (_: ProductCode.ProductCode) => boolean

export interface InvalidFormat {
  _tag: 'invalidFormat'
}
export interface AddressNotFound {
  _tag: 'addressNotFound'
}
export type AddressValidationError = InvalidFormat | AddressNotFound

export interface CheckedAddress {
  address: Inputs.UnvalidatedAddress
  _tag: 'checkedAddress'
}


export type CheckAddressExists = (_: Inputs.UnvalidatedAddress) => TaskEither<AddressValidationError, CheckedAddress>



export interface StandardPricingMethod {
  _tag: 'standard'
}

export interface PromoitionPricingMethod {
  code: PromitionCode.PromitionCode
  _tag: 'promoition'
}

export type PricingMethod = StandardPricingMethod | PromoitionPricingMethod

export interface ValidatedOrderLine {
  orderLineId: OrderLineId.OrderLineId
  productCode: ProductCode.ProductCode
  quantity: OrderQuantity.OrderQuantity  
}

export interface ValidatedOrder {
  orderId: OrderId.OrderId
  customerInfo: CustomerInfo
  shippingAddress: Address
  billingAddress: Address
  lines: ValidatedOrderLine[]
  pricingMethod: PricingMethod
}


export type ValidateOrder = (_: CheckProductCodeExists) => (_: CheckAddressExists) => (_: Inputs.UnvalidatedOrder) => TaskEither<Errors.ValidationError, ValidatedOrder>

export type GetProductPrice = (_: ProductCode.ProductCode) => Price.Price
export type TryGetProductPrice = (_: ProductCode.ProductCode) => Option<Price.Price>
export type GetPricingFunction = (_: PricingMethod) => GetProductPrice
export type GetStandardPrices = () => GetProductPrice
export type GetPromotionPrices = (_: PromitionCode.PromitionCode) => TryGetProductPrice


export interface PricedOrderProductLine {
  orderLineId: OrderLineId.OrderLineId
  productCode: ProductCode.ProductCode
  quantity: OrderQuantity.OrderQuantity
  linePrice: Price.Price
  _tag: 'pricedOrderProductLine'
}


export interface CommentLine {
  comment: string
  _tag: 'commentLine'
}
export type PricedOrderLine = CommentLine | PricedOrderProductLine

export interface PricedOrder {
  orderId: OrderId.OrderId
  customerInfo: CustomerInfo
  shippingAddress: Address
  billingAddress: Address
  amountToBill: BillingAmount.BillingAmount
  lines: PricedOrderLine[]
  pricingMethod: PricingMethod
} 

export type PriceOrder = (_: GetPricingFunction) => (_: ValidatedOrder) => TaskEither<Errors.PricingError, PricedOrder>




export enum ShippingMethod {
  PostalService,
  Fedex24,
  Fedex48,
  Ups48
}

export interface ShippingInfo {
  shippingMethod: ShippingMethod
  shippingCost: Price.Price  
}

export interface PricedOrderWithShippingMethod {
  shippingInfo: ShippingInfo
  pricedOrder: PricedOrder
}

export type CalculateShippingCost = (_: PricedOrder) => Price.Price

export type AddShippingInfoToOrder = (_ :CalculateShippingCost) => (_: PricedOrder) => PricedOrderWithShippingMethod

export type FreeVipShipping = (_: PricedOrderWithShippingMethod) => PricedOrderWithShippingMethod

export namespace HtmlString {
  export interface HtmlString extends Newtype<{readonly HtmlString: unique symbol}, string>{}
  const isoHtmlString = iso<HtmlString>()
  export const create = (str: string): HtmlString => isoHtmlString.wrap(str)
  export const value = (html: HtmlString): string => isoHtmlString.unwrap(html)

} 
export interface OrderAcknowledgment {
  emailAddress: EmailAddress.EmailAddress
  letter: HtmlString.HtmlString
}

export type CreateOrderAcknowledgmentLetter = (_: PricedOrderWithShippingMethod) => HtmlString.HtmlString



export enum SendResult {
  Sent,
  NotSent
}

export type SendOrderAcknowledgment = (_: OrderAcknowledgment) => SendResult


export type AcknowledgeOrder = (_: CreateOrderAcknowledgmentLetter) => (_: SendOrderAcknowledgment) => (_: PricedOrderWithShippingMethod) => Option<Outputs.OrderAcknowledgmentSent>

export type CreateEvents = (_: PricedOrder) => (_: Option<Outputs.OrderAcknowledgmentSent>) => Outputs.PlaceOrderEvent[]