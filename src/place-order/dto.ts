import { Inputs, Outputs, Errors } from './types'
import { either, Either, right } from 'fp-ts/lib/Either'
import { CustomerInfo, createCustomerInfo, createPersonalName, PersonalName, Address } from '../compound-types'
import { Do } from 'fp-ts-contrib/lib/Do'
import { EmailAddress, VipStatus, String50, ZipCode, USStateCode, OrderLineId, ProductCode, OrderQuantity, Price, PdfAttachment, OrderId, BillingAmount } from '../common/simple-types'
import { curry, Curried2 } from 'fp-ts/lib/function'
import { } from 'fp-ts/lib/Applicative'
import { liftA2, sequenceT } from 'fp-ts/lib/Apply'
import { sequence } from 'fp-ts/lib/Traversable';
import { some } from 'fp-ts/lib/Option'
import { PricedOrderLine } from '../internal-types';
interface CustomerInfoDto {
  firstName: string
  lastName: string
  emailAddress: string
  vipStatus: string
}

namespace CustomerInfoDto {



  export const toUnvalidatedCustomerDto = (dto: CustomerInfoDto): Inputs.UnvalidatedCustomerInfo => ({
    emailAddress: dto.emailAddress,
    firstName: dto.firstName,
    lastName: dto.lastName,
    vipStatus: dto.vipStatus
  })


  export const toCustomerInfo = (dto: CustomerInfoDto): Either<string, CustomerInfo> => {
    const result: Either<string, CustomerInfo> = Do(either)
      .bind('firstName', String50.createEither('FirstName', dto.firstName))
      .bind('lastName', String50.createEither('LastName', dto.lastName))
      .bind('email', EmailAddress.createEither('EmailAddress', dto.emailAddress))
      .bind('vipStatus', VipStatus.createEither('VipStatus', dto.vipStatus))
      .return((params) => ({
        name: {
          firstName: params.firstName,
          lastName: params.lastName
        },
        emailAddress: params.email,
        vipStatus: params.vipStatus
      }))

    return result
  }


  const fromCustomerInfo = (domain: CustomerInfo): CustomerInfoDto => ({
    firstName: String50.value(domain.name.firstName),
    lastName: String50.value(domain.name.lastName),
    emailAddress: EmailAddress.value(domain.emailAddress),
    vipStatus: VipStatus.value(domain.vipStatus)
  })

}



export namespace AddressDTO {
  export interface AddressDTO {
    addressLine1: string
    addressLine2: string
    addressLine3: string
    addressLine4: string
    city: string
    zipCode: string
    state: string
    country: string
  }

  export const toUnvalidatedAddress = (dto: AddressDTO): Inputs.UnvalidatedAddress => ({
    addressLine1: dto.addressLine1,
    addressLine2: dto.addressLine2,
    addressLine3: dto.addressLine3,
    addressLine4: dto.addressLine4,
    city: dto.city,
    zipCode: dto.zipCode,
    country: dto.country,
    state: dto.state
  })

  export const toAddress = (dto: AddressDTO): Either<string, Address> => {

    return Do(either)
      .bind('addressLine1', String50.createEither('AddressLine1', dto.addressLine1))
      .bind('addressLine2', String50.createOption('AddressLine2', dto.addressLine2))
      .bind('addressLine3', String50.createOption('AddressLine3', dto.addressLine3))
      .bind('addressLine4', String50.createOption('AddressLine4', dto.addressLine4))
      .bind('city', String50.createEither('City', dto.city))
      .bind('zipCode', ZipCode.createEither('ZipCode', dto.zipCode))
      .bind('state', USStateCode.createEither('UsStateCode', dto.state))
      .bind('country', String50.createEither('Country', dto.country))
      .return((params): Address => ({
        addressLine1: params.addressLine1,
        addressLine2: params.addressLine2,
        addressLine3: params.addressLine3,
        addressLine4: params.addressLine4,
        city: params.city,
        zipCode: params.zipCode,
        state: params.state,
        country: params.country
      }))
  }

  export const fromAddress = (domain: Address): AddressDTO => ({
    addressLine1: String50.value(domain.addressLine1),
    addressLine2: domain.addressLine2.map(String50.value).getOrElse(""),
    addressLine3: domain.addressLine3.map(String50.value).getOrElse(""),
    addressLine4: domain.addressLine4.map(String50.value).getOrElse(""),
    city: String50.value(domain.city),
    country: String50.value(domain.country),
    state: USStateCode.value(domain.state),
    zipCode: ZipCode.value(domain.zipCode)

  })
}




namespace OrderFormLineDto {
  export interface OrderFormLineDto {
    orderLineId: string
    productCode: string
    quantity: number
  }
  
  export const toUnvalidatedOrderLine = (dto: OrderFormLineDto): Inputs.UnvalidatedOrderLine => ({
    orderLineId: dto.orderLineId,
    productCode: dto.productCode,
    quantity: dto.quantity
  })
}

export namespace PricedOrderLineDto {

  export interface PricedOrderLineDto {
    orderLineId?: string
    productCode?: string
    quantity?: number
    linePrice?: number
    comment: string
  }
  export const fromDomain = (domain: PricedOrderLine): PricedOrderLineDto => {
    switch (domain._tag) {
      case 'pricedOrderProductLine': return {
        orderLineId: OrderLineId.value(domain.orderLineId),
        productCode: ProductCode.value(domain.productCode),
        quantity: OrderQuantity.value(domain.quantity),
        linePrice: Price.value(domain.linePrice),
        comment: ""
      }
      case 'commentLine': return {
        comment: domain.comment
      }
    }
  }
}

export namespace OrderFromDto {
  export interface OrderFromDto {
    orderId: string
    customerInfo: CustomerInfoDto
    shippingAddress: AddressDTO.AddressDTO
    billingAddress: AddressDTO.AddressDTO
    lines: OrderFormLineDto.OrderFormLineDto[]
    promotionCode: string
  }

  export const toUnvalidatedOrder = (dto: OrderFromDto): Inputs.UnvalidatedOrder => ({
    orderId: dto.orderId,
      customerInfo: CustomerInfoDto.toUnvalidatedCustomerDto(dto.customerInfo),
      shippingAddress: AddressDTO.toUnvalidatedAddress(dto.shippingAddress),
      billingAddress: AddressDTO.toUnvalidatedAddress(dto.billingAddress),
      lines: dto.lines.map(OrderFormLineDto.toUnvalidatedOrderLine),
      promotionCode: dto.promotionCode
  })
}

export namespace ShippableOrderDTO {
  export interface ShippableOrderLineDto {
    productCode: string
    quantity: number
  }

  export interface ShippableOrderPlacedDto {
    orderId: string
    shippingAddress: AddressDTO.AddressDTO
    shipmentLines:  ShippableOrderLineDto[]
    pdf: PdfAttachment.PdfAttachment
  }

  export const fromShippableOrderLine = (domain: Outputs.ShippableOrderLine): ShippableOrderLineDto => ({
    productCode: ProductCode.value(domain.productCode),
    quantity: OrderQuantity.value(domain.quantity)
  })

  export const fromDomain = (domain: Outputs.ShippableOrderPlaced): ShippableOrderPlacedDto => ({
    orderId: OrderId.value(domain.orderId),
    pdf: domain.pdfAttachment,
    shipmentLines: domain.shipmentLines.map(fromShippableOrderLine),
    shippingAddress: AddressDTO.fromAddress(domain.shippingAddress)
  })
}

export namespace BillableOrderPlacedDto {
  export interface BillableOrderPlacedDto {
    orderId: string
    billingAddress: AddressDTO.AddressDTO
    amountToBill: number
  }

  export const fromDomain = (domain: Outputs.BillableOrderPlaced): BillableOrderPlacedDto => ({
    orderId: OrderId.value(domain.orderId),
    billingAddress: AddressDTO.fromAddress(domain.billingAddress),
    amountToBill: BillingAmount.value(domain.amounttoBill)
  })
}

export namespace OrderAcknowledgmentSentDto {
  export interface OrderAcknowledgmentSentDto {
    orderId: string
    emailAddress: string
  }

  export const fromDomain = (domain: Outputs.OrderAcknowledgmentSent): OrderAcknowledgmentSentDto => ({
    emailAddress: EmailAddress.value(domain.emailAddress),
    orderId: OrderId.value(domain.orderId)
  })
}

export namespace PlaceOrderEventDto {
  export type PlaceOrderEventDto = {[key: string]: any} // <string, any>
  export const fromDomain = (domain: Outputs.PlaceOrderEvent): PlaceOrderEventDto => {
    switch (domain._tag) {
      case 'bilableOrderPlaced': return {
        'billableOrderPlaced': BillableOrderPlacedDto.fromDomain(domain)
      }
      case 'orderAcknowledgmentSent': return {
        'orderAcknowledgmentSent': OrderAcknowledgmentSentDto.fromDomain(domain)
      }
      case 'shippableOrderPlaced': return {
        'shippableOrderPlaced': ShippableOrderDTO.fromDomain(domain)
      }
    }
  }
}

export namespace PlaceOrderErrorDto {
  export interface PlaceOrderErrorDto {
    code: string
    message: string
  }

  export const fromDomain = (domain: Errors.PlaceOrderError): PlaceOrderErrorDto => {
    switch(domain._tag) {
      case 'pricingError': return {
        code: 'PricingError',
        message: domain.error
      }
      case 'remoteServiceError': return {
        code: 'RemoteServiceError',
        message: `${domain.service.name} ${domain.exception.message}`
      }
      case 'validationError': return {
        code: 'ValidationError',
        message: domain.error
      }
    }
  }
}