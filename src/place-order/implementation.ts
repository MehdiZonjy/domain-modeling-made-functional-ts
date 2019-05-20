import { Inputs, Errors, Outputs, PlaceOrder } from "./types";
import { CustomerInfo, Address } from "../compound-types";
import * as Either from "fp-ts/lib/Either";
import { String50, EmailAddress, VipStatus, ZipCode, USStateCode, OrderId, OrderLineId, ProductCode, OrderQuantity, Price, PromitionCode, BillingAmount } from "../common/simple-types";
import { Do } from 'fp-ts-contrib/lib/Do'
import { CheckedAddress, CheckAddressExists, CheckProductCodeExists, ValidatedOrderLine, ValidateOrder, PricingMethod, GetProductPrice, PricedOrderLine, ValidatedOrder, CommentLine, PriceOrder, GetPricingFunction, PricedOrder, CalculateShippingCost, AddShippingInfoToOrder, PricedOrderWithShippingMethod, ShippingInfo, ShippingMethod, FreeVipShipping, AcknowledgeOrder, SendOrderAcknowledgment, CreateOrderAcknowledgmentLetter, OrderAcknowledgment, SendResult, CreateEvents } from "../internal-types";
import { TaskEither, right, taskEither } from "fp-ts/lib/TaskEither"
import { compose, curry, flip } from 'fp-ts/lib/function'
import { array, catOptions, } from 'fp-ts/lib/Array'
import * as R from 'ramda'
import { createPricingMethod } from "./pricing";
import { Option, none, some, option } from "fp-ts/lib/Option";
import { BillableOrderPlacedDto } from "./dto";
import either from "ramda/es/either";
export const toCustomerInfo = (unvalidatedCustomerInfo: Inputs.UnvalidatedCustomerInfo): Either.Either<Errors.ValidationError, CustomerInfo> => {
  return Do(Either.either)
    .bindL('firstName', () => String50.createEither('FirstName', unvalidatedCustomerInfo.firstName).mapLeft(Errors.validationError))
    .bindL('lastName', () => String50.createEither('FirstName', unvalidatedCustomerInfo.lastName).mapLeft(Errors.validationError))
    .bindL('emailAddress', () => EmailAddress.createEither('EmailAddress', unvalidatedCustomerInfo.emailAddress).mapLeft(Errors.validationError))
    .bindL('vipStatus', () => VipStatus.createEither('VipStatus', unvalidatedCustomerInfo.vipStatus).mapLeft(Errors.validationError))
    .return(params => ({
      name: {
        firstName: params.firstName,
        lastName: params.lastName
      },
      emailAddress: params.emailAddress,
      vipStatus: params.vipStatus
    }))
}


export const toAddress = (checkedAddress: CheckedAddress): Either.Either<Errors.ValidationError, Address> => {
  return Do(Either.either)
    .bindL('addressLine1', () => String50.createEither('AddressLine1', checkedAddress.address.addressLine1).mapLeft(Errors.validationError))
    .bindL('addressLine2', () => String50.createOption('AddressLine2', checkedAddress.address.addressLine2).mapLeft(Errors.validationError))
    .bindL('addressLine3', () => String50.createOption('AddressLine3', checkedAddress.address.addressLine2).mapLeft(Errors.validationError))
    .bindL('addressLine4', () => String50.createOption('AddressLine4', checkedAddress.address.addressLine2).mapLeft(Errors.validationError))
    .bindL('city', () => String50.createEither('City', checkedAddress.address.city).mapLeft(Errors.validationError))
    .bindL('zipCode', () => ZipCode.createEither('ZipCode', checkedAddress.address.zipCode).mapLeft(Errors.validationError))
    .bindL('state', () => USStateCode.createEither('State', checkedAddress.address.state).mapLeft(Errors.validationError))
    .bindL('country', () => String50.createEither('Country', checkedAddress.address.country).mapLeft(Errors.validationError))
    .return(params => ({
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

export const toCheckedAddress = (checkAddress: CheckAddressExists) => (address: Inputs.UnvalidatedAddress): TaskEither<Errors.ValidationError, CheckedAddress> => {
  return checkAddress(address).mapLeft(error => {
    switch (error._tag) {
      case 'addressNotFound': return Errors.validationError('Address not found')
      case 'invalidFormat': return Errors.validationError('Address has bed format')
    }
  })
}


const toOrderId = (orderId: string): Either.Either<Errors.ValidationError, OrderId.OrderId> => OrderId.createEither('OrderId', orderId).mapLeft(Errors.validationError)

const toOrderLineId = (orderLineId: string): Either.Either<Errors.ValidationError, OrderLineId.OrderLineId> => OrderLineId.createEither('OrderLineId', orderLineId).mapLeft(Errors.validationError)

const toProductCode = (checkProdctCodeExists: CheckProductCodeExists) => (productCode: string): Either.Either<Errors.ValidationError, ProductCode.ProductCode> => {
  const checkProduct = (productCode: ProductCode.ProductCode): Either.Either<Errors.ValidationError, ProductCode.ProductCode> => {
    if (checkProdctCodeExists(productCode)) {
      return Either.right(productCode)
    } else {
      return Either.left(Errors.validationError(`Invalid: ${ProductCode.value(productCode)}`))
    }
  }

  return ProductCode.createEither('ProductCode', productCode)
    .mapLeft(Errors.validationError)
    .chain(checkProduct)
}

const toPricingMethod = (promo: string): Either.Either<Errors.ValidationError, PricingMethod> =>
  createPricingMethod(promo).mapLeft(Errors.validationError)

const toOrderQuantity = (productCode: ProductCode.ProductCode) => (quantity: number): Either.Either<Errors.ValidationError, OrderQuantity.OrderQuantity> =>
  OrderQuantity.createEither('OrderQuantity', productCode, quantity).mapLeft(Errors.validationError)


const toValidateOrderLine = (checkProductExists: CheckProductCodeExists) => (unvalidatedOrderLine: Inputs.UnvalidatedOrderLine): Either.Either<Errors.ValidationError, ValidatedOrderLine> => {
  return Do(Either.either)
    .bindL('orderLineId', () => toOrderLineId(unvalidatedOrderLine.orderLineId))
    .bindL('productCode', () => toProductCode(checkProductExists)(unvalidatedOrderLine.productCode))
    .bindL('quantity', ({ productCode }) => toOrderQuantity(productCode)(unvalidatedOrderLine.quantity))
    .return(params => ({
      orderLineId: params.orderLineId,
      productCode: params.productCode,
      quantity: params.quantity
    }))
}


const validateOrder: ValidateOrder = (checkProductCodeExists: CheckProductCodeExists) => (checkAddressExists: CheckAddressExists) => (unvalidatedOrder: Inputs.UnvalidatedOrder): TaskEither<Errors.ValidationError, ValidatedOrder> => {
  // const x2: <FL, A>(ta: Either.Either<FL, A>[]) => Either.Either<FL, A[]> = array.sequence(Either.either)
  type Sequence = (ta: Either.Either<Errors.ValidationError, ValidatedOrderLine>[]) => Either.Either<Errors.ValidationError, ValidatedOrderLine[]>
  type Mapper = (_: Inputs.UnvalidatedOrderLine[]) => Either.Either<Errors.ValidationError, ValidatedOrderLine>[]

  const s = Do(taskEither)
    .bindL('orderId', () => compose(taskEither.fromEither, toOrderId)(unvalidatedOrder.orderId))
    .bindL('customerInfo', () => compose(taskEither.fromEither, toCustomerInfo)(unvalidatedOrder.customerInfo))
    .bindL('checkedShippingAddress', () => toCheckedAddress(checkAddressExists)(unvalidatedOrder.shippingAddress))
    .bindL('shippingAddress', ({ checkedShippingAddress }) => compose(taskEither.fromEither, toAddress)(checkedShippingAddress))
    .bindL('checkedBillingAddress', () => toCheckedAddress(checkAddressExists)(unvalidatedOrder.billingAddress))
    .bindL('billingAddress', ({ checkedBillingAddress }) => compose(taskEither.fromEither, toAddress)(checkedBillingAddress))
    .bindL('lines', () => R.compose(
      taskEither.fromEither,
      array.sequence(Either.either) as Sequence,
      R.map(toValidateOrderLine(checkProductCodeExists)) as Mapper)
      (unvalidatedOrder.lines))
    .bindL('pricingMethod', () => compose(taskEither.fromEither, toPricingMethod)(unvalidatedOrder.promotionCode))
    .return(params => ({
      orderId: params.orderId,
      customerInfo: params.customerInfo,
      shippingAddress: params.shippingAddress,
      billingAddress: params.billingAddress,
      lines: params.lines,
      pricingMethod: params.pricingMethod
    }))

  return s
}

const toPricedOrderLine = (getProductPrice: GetProductPrice) => (validatedOrderLine: ValidatedOrderLine): Either.Either<Errors.PricingError, PricedOrderLine> => {
  return Do(Either.either)
    .bindL('qty', () => Either.right<Errors.PricingError, number>(OrderQuantity.value(validatedOrderLine.quantity)))
    .bindL('price', () => Either.right(getProductPrice(validatedOrderLine.productCode)))
    .bindL('linePrice', ({ qty, price }) => Price.multiple(qty, price).mapLeft(Errors.pricingError))
    .return(params => ({
      orderLineId: validatedOrderLine.orderLineId,
      productCode: validatedOrderLine.productCode,
      quantity: validatedOrderLine.quantity,
      linePrice: params.linePrice,
      _tag: 'pricedOrderProductLine'
    }))
}

const addCommentLine = (pricingMethod: PricingMethod) => (lines: PricedOrderLine[]): PricedOrderLine[] => {
  switch (pricingMethod._tag) {
    case 'standard': return lines
    case 'promoition':
      const commentLine: CommentLine = {
        _tag: 'commentLine',
        comment: `Applied promotion ${PromitionCode.value(pricingMethod.code)}`
      }
      return [...lines, commentLine]
  }
}

const getLinePrice = (line: PricedOrderLine): Price.Price => {
  switch (line._tag) {
    case 'commentLine': return Price.createUnsafe(0)
    case 'pricedOrderProductLine': return line.linePrice
  }
}

const priceOrder: PriceOrder = (getPricingFunc: GetPricingFunction) => (validatedOrder: ValidatedOrder): Either.Either<Errors.PricingError, PricedOrder> => {
  const getProductPrice = getPricingFunc(validatedOrder.pricingMethod)

  const appendCommentLine = (lines: Either.Either<Errors.PricingError, PricedOrderLine[]>): Either.Either<Errors.PricingError, PricedOrderLine[]> => lines.map(lines => addCommentLine(validatedOrder.pricingMethod)(lines))

  return Do(Either.either)
    .bindL('lines', () => compose(
      appendCommentLine,
      array.sequence(Either.either),
      R.map(toPricedOrderLine(getProductPrice))
    )(validatedOrder.lines))
    .bindL('amountToBill', ({ lines }) => BillingAmount.sumPrices(lines.map(getLinePrice)).mapLeft(Errors.pricingError))
    .return(params => ({
      orderId: validatedOrder.orderId,
      customerInfo: validatedOrder.customerInfo,
      shippingAddress: validatedOrder.shippingAddress,
      billingAddress: validatedOrder.billingAddress,
      lines: params.lines,
      amountToBill: params.amountToBill,
      pricingMethod: validatedOrder.pricingMethod
    }))
}


enum AddressCategory {
  UsLocalState,
  UsRemoteState,
  International
}
const categorieShippingAddress = (address: Address): AddressCategory => {
  if (String50.value(address.country) === 'US') {
    switch (USStateCode.value(address.state)) {
      case 'CA':
      case 'OR':
      case 'AZ':
      case 'NV':
        return AddressCategory.UsLocalState
      default: AddressCategory.UsRemoteState

    }
  }
  return AddressCategory.International
}


export const calculateShippingCost: CalculateShippingCost = (pricedOrder: PricedOrder): Price.Price => {
  switch (categorieShippingAddress(pricedOrder.shippingAddress)) {
    case AddressCategory.International: return Price.createUnsafe(20.0)
    case AddressCategory.UsLocalState: return Price.createUnsafe(5.0)
    case AddressCategory.UsRemoteState: return Price.createUnsafe(10.0)
  }
}

const addShippingInfoToOrder: AddShippingInfoToOrder = (calculateShippingCost: CalculateShippingCost) => (pricedOrder: PricedOrder): PricedOrderWithShippingMethod => {
  const shippingInfo: ShippingInfo = {
    shippingCost: calculateShippingCost(pricedOrder),
    shippingMethod: ShippingMethod.Fedex24
  }

  return {
    pricedOrder,
    shippingInfo
  }

}

const freeVipShipping: FreeVipShipping = (order: PricedOrderWithShippingMethod): PricedOrderWithShippingMethod => {
  const createShippingInfo = () => {
    switch (order.pricedOrder.customerInfo.vipStatus._tag) {
      case "normal": return order.shippingInfo
      case 'vip': return {
        ...order.shippingInfo,
        shippingCost: Price.createUnsafe(0),
        shippingMethod: ShippingMethod.Fedex24
      }
    }
  }

  // might be worth using monocle-ts
  return {
    ...order,
    shippingInfo: createShippingInfo()
  }
}

const acknowledgeOrder: AcknowledgeOrder = (createOrderAckLetter: CreateOrderAcknowledgmentLetter) => (sendOrderAck: SendOrderAcknowledgment) => (orderWithShipping: PricedOrderWithShippingMethod): Option<Outputs.OrderAcknowledgmentSent> => {

  const pricedOrder = orderWithShipping.pricedOrder
  const letter = createOrderAckLetter(orderWithShipping)

  const acknowledgment: OrderAcknowledgment = {
    emailAddress: pricedOrder.customerInfo.emailAddress,
    letter
  }

  switch (sendOrderAck(acknowledgment)) {
    case SendResult.NotSent: return none
    case SendResult.Sent: {
      const event: Outputs.OrderAcknowledgmentSent = {
        orderId: pricedOrder.orderId,
        emailAddress: pricedOrder.customerInfo.emailAddress,
        _tag: 'orderAcknowledgmentSent'
      }
      return some(event)
    }
  }
}

const makeShipmentLine = (line: PricedOrderLine): Option<Outputs.ShippableOrderLine> => {
  switch (line._tag) {
    case 'pricedOrderProductLine': return some({
      productCode: line.productCode,
      quantity: line.quantity
    })
    case 'commentLine': return none
  }
}

const createShippingEvent = (placedOrder: PricedOrder): Outputs.ShippableOrderPlaced => {
  return {
    orderId: placedOrder.orderId,
    shippingAddress: placedOrder.shippingAddress,
    shipmentLines: catOptions(placedOrder.lines.map(makeShipmentLine)),
    pdfAttachment: {
      name: `Order${OrderId.value(placedOrder.orderId)}.pdf`,
      bytes: Buffer.from([])
    },
    _tag: 'shippableOrderPlaced'
  }
}

const createBillingEvent = (placedOrder: PricedOrder): Option<Outputs.BillableOrderPlaced> => {
  const billingAmount = BillingAmount.value(placedOrder.amountToBill)
  if (billingAmount > 0) {
    return some({
      orderId: placedOrder.orderId,
      billingAddress: placedOrder.billingAddress,
      amountToBill: placedOrder.amountToBill,
      _tag: 'bilableOrderPlaced'
    })
  }
  return none
}

const createEvents: CreateEvents = (pricedOrder: PricedOrder) => (ackEvent: Option<Outputs.OrderAcknowledgmentSent>): Outputs.PlaceOrderEvent[] => {
  const ackEvents: Outputs.PlaceOrderEvent[] = ackEvent.fold([], s => [s])
  const shippingEvents: Outputs.PlaceOrderEvent[] = [createShippingEvent(pricedOrder)]
  const billingEvents: Outputs.PlaceOrderEvent[] = createBillingEvent(pricedOrder).fold([], e => [e])

  return [
    ...ackEvents,
    ...shippingEvents,
    ...billingEvents
  ]
}

export const placeOrder = (checkProductExits: CheckProductCodeExists) => (checkAddressExists: CheckAddressExists) => (getProductPrice: GetPricingFunction) => (calculateShippingCost: CalculateShippingCost) => (createOrderAckLetter: CreateOrderAcknowledgmentLetter) => (sendOrderAckLetter: SendOrderAcknowledgment): PlaceOrder => (unvalidatedOrder: Inputs.UnvalidatedOrder): TaskEither<Errors.PlaceOrderError, Outputs.PlaceOrderEvent[]> => {
  return Do(taskEither)
    .bindL('validatedOrder', () => validateOrder(checkProductExits)(checkAddressExists)(unvalidatedOrder).mapLeft(e => e as Errors.PlaceOrderError))
    .bindL('pricedOrder', ({ validatedOrder }) => taskEither.fromEither(priceOrder(getProductPrice)(validatedOrder)))
    .bindL('pricedOrderWithShipping', ({ pricedOrder }) => compose(taskEither.of, freeVipShipping, addShippingInfoToOrder(calculateShippingCost))(pricedOrder).mapLeft(e => e as Errors.PlaceOrderError))
    .bindL('ackOption', ({ pricedOrderWithShipping }) => taskEither.of(acknowledgeOrder(createOrderAckLetter)(sendOrderAckLetter)(pricedOrderWithShipping)))
    .return(({ pricedOrder, ackOption }) => createEvents(pricedOrder)(ackOption))
}