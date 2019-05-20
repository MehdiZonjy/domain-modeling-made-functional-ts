import { CheckProductCodeExists, CheckAddressExists, AddressValidationError, CheckedAddress, GetProductPrice, TryGetProductPrice, GetPricingFunction, CreateOrderAcknowledgmentLetter, PricedOrder, HtmlString, PricedOrderWithShippingMethod, SendOrderAcknowledgment, OrderAcknowledgment, SendResult } from "./internal-types";
import { ProductCode, Price, PromitionCode } from "./common/simple-types";
import { Inputs, Errors, Outputs } from "./place-order/types";
import { TaskEither, taskEither } from "fp-ts/lib/TaskEither";
import { some, none } from "fp-ts/lib/Option";

import * as PricingModule from './place-order/pricing'
import * as Implementation from './place-order/implementation'
import *as Either from 'fp-ts/lib/Either'
import Express from 'express'
import { OrderFromDto, PlaceOrderErrorDto, PlaceOrderEventDto } from "./place-order/dto";
import *as R from 'ramda'
import { parseOrderDTO } from './dto-parser'
import * as BodyParser from 'body-parser'
const checkProductExits: CheckProductCodeExists = (_: ProductCode.ProductCode) => true

const checkAddressExists: CheckAddressExists = (unvalidatedAddress: Inputs.UnvalidatedAddress): TaskEither<AddressValidationError, CheckedAddress> =>
  taskEither.of({
    address: unvalidatedAddress,
    _tag: 'checkedAddress'
  })

const getStandardPrices = (): GetProductPrice => (product: ProductCode.ProductCode): Price.Price => Price.createUnsafe(10)

const getPromoitionPrices = (promotionCode: PromitionCode.PromitionCode): TryGetProductPrice => {
  const halfPricePromotion: TryGetProductPrice = (productCode: ProductCode.ProductCode) => {
    if (ProductCode.value(productCode) === 'ONSALE') {
      return some(Price.createUnsafe(5.5))
    }
    return none
  }

  const quarterPricePromotion: TryGetProductPrice = (productCode: ProductCode.ProductCode) => {
    if (ProductCode.value(productCode) === 'ONSALE') {
      return some(Price.createUnsafe(2.5))
    }
    return none
  }
  const noPromotion: TryGetProductPrice = (_: ProductCode.ProductCode) => none

  switch (PromitionCode.value(promotionCode)) {
    case 'HALF': return halfPricePromotion
    case 'QUARTER': return quarterPricePromotion
    default: return noPromotion
  }
}

const getPricingFunction: GetPricingFunction = PricingModule.getPricingFunction(getStandardPrices)(getPromoitionPrices)
const calculateShippingCost = Implementation.calculateShippingCost

const createOrderAckLetter: CreateOrderAcknowledgmentLetter = (pricedOrder: PricedOrderWithShippingMethod) => HtmlString.create('<h1>Hello World</h1>')
const sendOrderAck: SendOrderAcknowledgment = (_: OrderAcknowledgment): SendResult => SendResult.Sent


interface HttpResponse {
  code: number
  body: {}
}

const onErrors = (placeOrderError: Errors.PlaceOrderError): HttpResponse => {

  const errorDto = PlaceOrderErrorDto.fromDomain(placeOrderError)

  const statusCode = (): number => {
    switch (placeOrderError._tag) {
      case 'pricingError':
      case 'validationError':
        return 400
      case 'remoteServiceError':
        return 503
    }
  }
  return {
    body: errorDto,
    code: statusCode()
  }
}

const onSuccess = (events: Outputs.PlaceOrderEvent[]): HttpResponse => {
  const eventsDto = events.map(PlaceOrderEventDto.fromDomain)
  return {
    code: 200,
    body: eventsDto
  }
}

const workFlow = Implementation.placeOrder(checkProductExits)(checkAddressExists)(getPricingFunction)(calculateShippingCost)(createOrderAckLetter)(sendOrderAck)
const postOrder = async (req: Express.Request, res: Express.Response) => {

  const httpRes = await taskEither.fromEither(parseOrderDTO(req.body))
    .mapLeft(err => Errors.validationError(err) as Errors.PlaceOrderError)
    .map(OrderFromDto.toUnvalidatedOrder)
    .chain(workFlow)
    .fold(onErrors, onSuccess)
    .run()

  res.status(httpRes.code)
  res.send(httpRes.body)
}


const app = Express()
app.use(BodyParser.json())

app.post('/orders', postOrder)

app.listen(3000)


