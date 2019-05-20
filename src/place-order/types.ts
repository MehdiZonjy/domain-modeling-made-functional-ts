import { OrderId, ProductCode, OrderQuantity, EmailAddress, OrderLineId, Price, BillingAmount, PdfAttachment } from "../common/simple-types"
import { Address, CustomerInfo } from "../compound-types"
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { PricedOrder } from "../internal-types";


export namespace Inputs {

  export interface UnvalidatedCustomerInfo {
    firstName: string
    lastName: string
    emailAddress: string
    vipStatus: string
  }

  export interface UnvalidatedAddress {
    addressLine1: string
    addressLine2: string
    addressLine3: string
    addressLine4: string
    city: string
    zipCode: string
    state: string
    country: string
  }

  export interface UnvalidatedOrderLine {
    orderLineId: string
    productCode: string
    quantity: number
  }

  export interface UnvalidatedOrder {
    orderId: string
    customerInfo: UnvalidatedCustomerInfo
    shippingAddress: UnvalidatedAddress
    billingAddress: UnvalidatedAddress
    lines: UnvalidatedOrderLine[]
    promotionCode: string
  }
}

export namespace Outputs {
  export type BillableOrderPlaced = {
    orderId: OrderId.OrderId
    billingAddress: Address
    amountToBill: BillingAmount.BillingAmount
    _tag: 'bilableOrderPlaced'
  }

  export interface ShippableOrderLine {
    productCode: ProductCode.ProductCode
    quantity: OrderQuantity.OrderQuantity
  }

  export interface ShippableOrderPlaced {
    orderId: OrderId.OrderId
    shippingAddress: Address
    shipmentLines: ShippableOrderLine[]
    pdfAttachment: PdfAttachment.PdfAttachment
    _tag: 'shippableOrderPlaced'
  }


  export interface OrderAcknowledgmentSent {
    orderId: OrderId.OrderId
    emailAddress: EmailAddress.EmailAddress
    _tag: 'orderAcknowledgmentSent'
  }
  export interface OrderPlaced {
    order: PricedOrder
    _tag: 'orderPlaced'
  }

  export type PlaceOrderEvent = BillableOrderPlaced | ShippableOrderPlaced | OrderAcknowledgmentSent
}




export namespace Errors {

  export interface ValidationError {
    error: string
    _tag: 'validationError'
  }
  export interface PricingError {
    error: string
    _tag: 'pricingError'
  }

  export interface ServiceInfo {
    name: string
    endpoint: string
  }
  export interface RemoteServiceError {
    service: ServiceInfo
    exception: Error
    _tag: 'remoteServiceError'
  }

  export type PlaceOrderError = ValidationError | PricingError |  RemoteServiceError

  export const validationError = (error: string): ValidationError => ({
    _tag: 'validationError',
    error
  })

  export const pricingError = (error: string): PricingError => ({
    _tag:'pricingError',
    error
  })
}


export type PlaceOrder = (order: Inputs.UnvalidatedOrder) => TaskEither<Errors.PlaceOrderError, Outputs.PlaceOrderEvent[]>