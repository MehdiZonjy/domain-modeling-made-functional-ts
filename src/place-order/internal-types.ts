// import { ProductCode, PromitionCode, OrderLineId, OrderQuantity, OrderId, Price } from "../common/simple-types";
// import { Inputs, Errors } from "./types";
// import { TaskEither } from "fp-ts/lib/TaskEither";
// import { CheckedAddress } from "../internal-types";
// import { CustomerInfo, Address } from "../compound-types";
// import { Option } from "fp-ts/lib/Option";


// type CheckProductCodeExists = (_: ProductCode.ProductCode) => boolean

// interface InvalidFormat {
//   _tag: 'invalidFormat'
// }

// interface AddressNotFound {
//   _tag: 'addressNotFound'
// }

// type AddressValidationError = InvalidFormat | AddressNotFound


// type CheckedAddressExists = (_: Inputs.UnvalidatedAddress) => TaskEither<AddressValidationError, CheckedAddress>


// interface StandardPricingMethod {
//   _tag: 'standard'
// }
// interface PromotionPricingMethod {
//   promitionCode: PromitionCode.PromitionCode
//   _tag: 'promotion'

// }
// type PricingMethod = StandardPricingMethod | PromotionPricingMethod

// interface ValidatedOrderLine {
//   orderLineId: OrderLineId.OrderLineId
//   productCode: ProductCode.ProductCode
//   quantity: OrderQuantity.OrderQuantity
// }

// interface ValidatedOrder {
//   orderId: OrderId.OrderId
//   customerInfo: CustomerInfo
//   shippingAddress: Address
//   billingAddress: Address
//   lines: ValidatedOrderLine[]
//   pricingMethod: PricingMethod
// }

// export type ValidateOrder = (_: CheckProductCodeExists) => (_: CheckedAddressExists) => (_: Inputs.UnvalidatedOrder) => TaskEither<Errors.ValidationError, ValidatedOrder>

// export type GetProductPrice = (_: ProductCode.ProductCode) => Price.Price

// export type TryGetProductPrice = (_: ProductCode.ProductCode) => Option<Price.Price>

// export type GetPricingFunction = (_:PricingMethod) => GetProductPrice

// export type GetStandardPrices = () => GetProductPrice