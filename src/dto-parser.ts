import Ajv from 'ajv'
import { OrderFromDto } from './place-order/dto';
import { Either, parseJSON, toError, left, right } from 'fp-ts/lib/Either';
import { stringify } from 'querystring';


const schema = {
  properties: {
    orderId: { type: 'string' },
    customerInfo: {
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        emailAddress: { type: 'string' },
        vipStatus: { type: 'string' },
      },
      type: 'object',
      required: ['firstName', 'lastName', 'emailAddress', 'vipStatus']
    },
    shippingAddress: {
      properties: {
        addressLine1: { type: 'string' },
        addressLine2: { type: 'string' },
        addressLine3: { type: 'string' },
        addressLine4: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' }
      },
      type: 'object',
      required: ['addressLine1', 'addressLine2', 'addressLine3', 'addressLine4', 'city', 'zipCode', 'state', 'country']
    },
    billingAddress: {
      properties: {
        addressLine1: { type: 'string' },
        addressLine2: { type: 'string' },
        addressLine3: { type: 'string' },
        addressLine4: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string' },
        state: { type: 'string' },
        country: { type: 'string' }
      },
      type: 'object',
      required: ['addressLine1', 'addressLine2', 'addressLine3', 'addressLine4', 'city', 'zipCode', 'state', 'country']
    },
    lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          orderLineId: { type: 'string' },
          productCode: { type: 'string' },
          quantity: { type: 'number' },
        },
        required: ['orderLineId', 'productCode', 'quantity']
      }
    },
    promotionCode: { type: 'string' }

  },
  required: ['orderId', 'customerInfo', 'shippingAddress', 'billingAddress', 'lines', 'promotionCode'],
  type: 'object'
}




const validator = Ajv().compile(schema)
type Validator = (obj: unknown) => boolean | PromiseLike<any>

const validate = (validator: Validator, obj: unknown): obj is OrderFromDto.OrderFromDto => {
  if (validator(obj)) {
    return true
  }
  return false
}


export const parseOrderDTO = (o: unknown): Either<string, OrderFromDto.OrderFromDto> => {
  return right<string, unknown>(o)
    .chain(obj => {
      if (validate(validator, obj)) {
        return right(obj)
      }
      return left(JSON.stringify(validator.errors || []))
    })

}